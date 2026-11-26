(function () {
"use strict";
const meta = {"project":"5c944e4e-421e-4d8e-bb25-ed2830e065e2","artifact":"66af9019-b89d-4f67-b3ce-31f5e83a556b","app":"https://hark.com","share":"https://hark.com/site/5c944e4e-421e-4d8e-bb25-ed2830e065e2?hark_region=us"};
// site_runtime.js is the page-button runtime serve puts into every Hark page
// (site_document.go). Serve wraps it in a function whose first statement is
// `const meta = {...};`, so `meta` is read from this script's own text and
// never from an element a page could forge. It asks the Hark app framing the
// page whether its viewer may press (HELLO), and once the app allows it
// (ALLOW), reveals the buttons meta allows. It hands a press to the app, marks the pressed
// element with the press's state (data-hark-state), and gives the page
// window.Hark.safeHref, window.Hark.app (the page's backend, run by the app
// framing it as the viewer), window.Hark.shareLink and, when absent,
// window.Hark.data.

// MAX_URL_BYTES must equal maxSiteURLBytes in
// services/agent/internal/tools/website/site_manifest.go.
var MAX_URL_BYTES = 512

var ACTION = 'data-hark-action'
var READY = 'data-hark-ready'
var ITEM = 'data-hark-item'
var STATE = 'data-hark-state'

// HELLO, ALLOW, PRESS and RESULT must equal the message types in
// apps/frontend/src/lib/sitePressBridge.ts.
var HELLO = 'hark:hello'
var ALLOW = 'hark:allow'
var PRESS = 'hark:press'
var RESULT = 'hark:press-result'

// RESULT_TIMEOUT_MS is how long a press waits for the app's answer before it
// reads as failed.
var RESULT_TIMEOUT_MS = 15000

// AGENT_RESULT_TIMEOUT_MS is that wait for an agent press, which loads the
// page's backend before it sends. It must exceed
// AGENT_PRESS_REQUEST_TIMEOUT_MS in apps/frontend/src/lib/sitePressBridge.ts.
var AGENT_RESULT_TIMEOUT_MS = 80000

// LOAD, RUN and APP_RESULT must equal the message types in
// apps/frontend/src/lib/siteAppBridge.ts.
var LOAD = 'hark:load'
var RUN = 'hark:run'
var APP_RESULT = 'hark:result'

// APP_TIMEOUT_MS is how long Hark.app waits for the app's answer. It must
// exceed PANEL_APP_REQUEST_TIMEOUT_MS (330 s) in
// apps/frontend/src/lib/goApiPanelApp.ts, so the app's own deadline answers first.
var APP_TIMEOUT_MS = 340000

var kinds = {}
;(meta.actions || []).forEach(function (a) {
  kinds[a.id] = a.kind
})

// allowed is set once the app framing the page says its viewer may press,
// which only the page's owner may; the app's send checks every press again.
var allowed = false

// eligible reports whether meta lets el show once the app allows presses: a
// declared prompt or agent action, or a declared buy action with an item while
// buy is on.
function eligible(el) {
  if (!meta.app || !allowed) return false
  var kind = kinds[el.getAttribute(ACTION)]
  if (kind === 'prompt' || kind === 'agent') return true
  if (kind === 'buy') return !!meta.buy && el.hasAttribute(ITEM)
  return false
}

function reveal(el) {
  if (el.hasAttribute(READY) || !eligible(el)) return
  if (kinds[el.getAttribute(ACTION)] === 'buy' && meta.buy_label) {
    el.textContent = meta.buy_label
  }
  el.setAttribute(READY, '')
}

function revealWithin(node) {
  if (node.nodeType !== 1) return
  if (node.hasAttribute(ACTION)) reveal(node)
  node.querySelectorAll('[' + ACTION + ']').forEach(reveal)
}

var pending = {}
var nextRequest = 0

// setState marks every button for el's action and item with a press's state,
// so a copy of el the page made (a card's sheet) reads the same as el, even
// one made while the press was on its way. It tells the page once, through a
// bubbling hark:press event on a button still on the page, so a press from a
// sheet closed before the answer still reaches the page's listeners. A sent
// button reads as disabled, since a second tap sends nothing (settled), and
// says so itself (markSent).
function setState(el, actionId, state, code) {
  var buttons = sameButtons(el)
  buttons.forEach(function (b) {
    b.setAttribute(STATE, state)
    if (state === 'sent') markSent(b)
    else if (state !== 'sending') showNotice(b, noticeFor(state, code))
  })
  if (state === 'sent') showToast(SENT_LABEL)
  var onPage = el.isConnected ? el : buttons[0]
  onPage.dispatchEvent(
    new CustomEvent(PRESS, {
      bubbles: true,
      detail: { actionId: actionId, state: state, code: code || '' },
    }),
  )
}

// SENT_LABEL is what a sent button and the toast over the page say.
var SENT_LABEL = 'Sent to Hark'

// TOAST_MS is how long the toast stays over the page after a press is sent.
var TOAST_MS = 2400

var SVG_NS = 'http://www.w3.org/2000/svg'

// checkIcon is the 16px check a sent button and the toast lead with.
function checkIcon() {
  var svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('viewBox', '92 92 16 16')
  svg.setAttribute('width', '16')
  svg.setAttribute('height', '16')
  svg.setAttribute('fill', 'none')
  svg.setAttribute('aria-hidden', 'true')
  var path = document.createElementNS(SVG_NS, 'path')
  path.setAttribute(
    'd',
    'M93 99.55L95.7091 102.249C96.4999 103.037 96.8954 103.431 97.3511 103.579C97.7519 103.709 98.1836 103.709 98.5844 103.579C99.0401 103.431 99.4355 103.037 100.226 102.249L107 95.5',
  )
  path.setAttribute('stroke', 'currentColor')
  path.setAttribute('stroke-width', '2')
  svg.appendChild(path)
  return svg
}

// markSent turns el into a check and "Sent to Hark".
function markSent(el) {
  el.setAttribute('aria-disabled', 'true')
  el.replaceChildren(checkIcon(), document.createTextNode(SENT_LABEL))
}

// sameButtons is every button on the page for el's action and item, since
// pressing any of them sends the same thing, then el when it has left the page.
function sameButtons(el) {
  var action = el.getAttribute(ACTION)
  var item = el.getAttribute(ITEM)
  var all = [].filter.call(document.querySelectorAll('[' + ACTION + ']'), function (b) {
    return b.getAttribute(ACTION) === action && b.getAttribute(ITEM) === item
  })
  if (all.indexOf(el) < 0) all.push(el)
  return all
}

// NOTICES are what a button says in place of its own words for NOTICE_MS when
// its press did not reach Hark. The button then reads as it did and can be
// pressed again.
var NOTICES = {
  sign_in: 'Sign in to Hark',
  not_allowed: 'Owner only',
  failed: 'Not sent, try again',
}

// CODE_NOTICES are a button's words for an agent press refused because its
// page's data could not be read or sent; any other code falls back to its
// state's notice. Each key must equal a metrics.PagePressOutcome.
var CODE_NOTICES = {
  too_large: 'Too much to send',
  not_loaded: 'Page data unavailable, try again',
  walled: 'Needs a site sign-in',
}

var NOTICE_MS = 3000

// KIT_NOTICE_STYLE hides the message a site's hark.css may write after a
// button's words for a state, since the notice already stands in for them.
var KIT_NOTICE_STYLE =
  '[data-hark-action][data-hark-state="sign_in"]::after,' +
  '[data-hark-action][data-hark-state="not_allowed"]::after,' +
  '[data-hark-action][data-hark-state="failed"]::after{content:none!important}'

var kitNoticesHidden = false

// noticeFor is code's notice when it has one, else state's, or the failed one
// for a state it does not name.
function noticeFor(state, code) {
  if (Object.prototype.hasOwnProperty.call(CODE_NOTICES, code)) return CODE_NOTICES[code]
  if (Object.prototype.hasOwnProperty.call(NOTICES, state)) return NOTICES[state]
  return NOTICES.failed
}

// showNotice puts notice in el in place of its words, at least as wide as the
// words were so the row around it holds still, and puts the words back when
// the notice ends.
function showNotice(el, notice) {
  hideKitNotices()
  var words = Array.prototype.slice.call(el.childNodes)
  var minWidth = el.style.minWidth
  el.style.minWidth = el.getBoundingClientRect().width + 'px'
  el.replaceChildren(document.createTextNode(notice))
  setTimeout(function () {
    el.replaceChildren.apply(el, words)
    el.style.minWidth = minWidth
    el.removeAttribute(STATE)
  }, NOTICE_MS)
}

function hideKitNotices() {
  if (kitNoticesHidden) return
  kitNoticesHidden = true
  var style = document.createElement('style')
  style.textContent = KIT_NOTICE_STYLE
  document.head.appendChild(style)
}

// TOAST_STYLE draws the toast: the kit's primary capsule, which grows in from
// a blur at the bottom of the page and fades back out. Its colors read the
// kit's tokens and fall back to the kit's light values on a page without it.
var TOAST_STYLE =
  '.pill{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom,0px));z-index:2147483647;' +
  'display:flex;align-items:center;gap:12px;box-sizing:border-box;max-width:calc(100vw - 32px);height:48px;' +
  'padding:0 20px;border-radius:24px;background:var(--fill-primary,#1d1d1f);color:var(--text-primary-on,#f5f5f7);' +
  'font:500 15px/1.3 var(--sans,system-ui,-apple-system,sans-serif);white-space:nowrap;' +
  'box-shadow:var(--hark-shadow,0 8px 40px #1d1d1f1f);pointer-events:none;opacity:0;filter:blur(2px);' +
  'transform:translateX(-50%) scale(.8);transition:opacity 160ms,filter 160ms,transform 160ms;' +
  'transition-timing-function:cubic-bezier(.4,0,.2,1)}' +
  '.pill.shown{opacity:1;filter:blur(0);transform:translateX(-50%) scale(1);transition-duration:300ms}' +
  '.pill svg{flex:none}.pill span{overflow:hidden;text-overflow:ellipsis}' +
  '@media (prefers-reduced-motion:reduce){.pill,.pill.shown{filter:none;transform:translateX(-50%)}}'

var toast = null
var toastTimer = 0

// toastPill is the toast, made on first use inside a shadow root so
// the page's own styles cannot restyle or hide it.
function toastPill() {
  if (toast) return toast
  var host = document.createElement('div')
  var root = host.attachShadow({ mode: 'open' })
  var style = document.createElement('style')
  style.textContent = TOAST_STYLE
  toast = document.createElement('div')
  toast.className = 'pill'
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')
  toast.append(checkIcon(), document.createElement('span'))
  root.append(style, toast)
  document.body.appendChild(host)
  return toast
}

// showToast shows text in the toast for TOAST_MS. Layout is read before the
// toast is shown, so a toast made this moment still animates in.
function showToast(text) {
  var pill = toastPill()
  pill.lastChild.textContent = text
  pill.getBoundingClientRect()
  pill.classList.add('shown')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(function () {
    pill.classList.remove('shown')
  }, TOAST_MS)
}

// settled reports whether el's press is under way, already reached Hark, or
// still showing its notice, so a second tap sends nothing.
function settled(el) {
  return el.hasAttribute(STATE)
}

// press hands el's action to the app framing the page. A page nothing frames
// has no app to send it, and a settled button has sent already, so either
// press does nothing.
function press(el) {
  if (window.parent === window || settled(el)) return
  var appOrigin = new URL(meta.app).origin
  var actionId = el.getAttribute(ACTION)
  var kind = kinds[actionId]
  var requestId = String(++nextRequest)
  var timer = setTimeout(
    function () {
      if (!pending[requestId]) return
      delete pending[requestId]
      setState(el, actionId, 'failed', 'timeout')
    },
    kind === 'agent' ? AGENT_RESULT_TIMEOUT_MS : RESULT_TIMEOUT_MS,
  )
  pending[requestId] = { el: el, actionId: actionId, timer: timer }
  setState(el, actionId, 'sending')
  var msg = {
    type: PRESS,
    requestId: requestId,
    artifactId: meta.artifact,
    actionId: actionId,
    kind: kind,
  }
  var item = el.getAttribute(ITEM)
  if (item) msg.itemId = item
  window.parent.postMessage(msg, appOrigin)
}

// onAppMessage takes the app's answers: ALLOW reveals the buttons, and RESULT
// settles a press. Any other window's message is ignored.
function onAppMessage(e) {
  if (e.source !== window.parent || !meta.app || e.origin !== new URL(meta.app).origin) return
  var d = e.data
  if (d && d.type === APP_RESULT) {
    onAppResult(d)
    return
  }
  if (d && d.type === ALLOW) {
    allowed = true
    revealWithin(document.documentElement)
    return
  }
  onResult(d)
}

function onResult(d) {
  if (!d || d.type !== RESULT || !pending[d.requestId]) return
  var p = pending[d.requestId]
  delete pending[d.requestId]
  clearTimeout(p.timer)
  setState(p.el, p.actionId, String(d.state || 'failed'), d.code)
}

function onClick(e) {
  var target = e.target
  if (!(target instanceof Element)) return
  var el = target.closest('[' + ACTION + ']')
  if (!el || !el.hasAttribute(READY)) return
  e.preventDefault()
  press(el)
}

var appCalls = {}

// callApp asks the app framing the page to run the page's backend and
// resolves with its answer ({outcome, data, refusal, reason}), or rejects
// with an Error whose code says why the app could not answer. A page no app
// frames has no backend to reach.
function callApp(type, fields) {
  if (!meta.app || window.parent === window) {
    return Promise.reject(appError('not_in_hark'))
  }
  return new Promise(function (resolve, reject) {
    var requestId = 'app-' + ++nextRequest
    var timer = setTimeout(function () {
      delete appCalls[requestId]
      reject(appError('timeout'))
    }, APP_TIMEOUT_MS)
    appCalls[requestId] = { resolve: resolve, reject: reject, timer: timer }
    var msg = { type: type, requestId: requestId }
    Object.keys(fields).forEach(function (k) {
      msg[k] = fields[k]
    })
    window.parent.postMessage(msg, new URL(meta.app).origin)
  })
}

function onAppResult(d) {
  var call = appCalls[d.requestId]
  if (!call) return
  delete appCalls[d.requestId]
  clearTimeout(call.timer)
  if (d.ok) call.resolve(d.answer)
  else call.reject(appError(String(d.code || 'failed')))
}

function appError(code) {
  var err = new Error('Hark.app: ' + code)
  err.code = code
  return err
}

// safeHref returns s only for an https URL with a host and no user name or
// password, at most MAX_URL_BYTES long, as siteURL checks it; otherwise "#".
function safeHref(s) {
  if (typeof s !== 'string' || new TextEncoder().encode(s).length > MAX_URL_BYTES) return '#'
  try {
    var u = new URL(s)
    if (u.protocol !== 'https:' || !u.hostname || u.username || u.password) return '#'
    return s
  } catch (err) {
    return '#'
  }
}

// parseCSV and readData must read a block as the kit's hark-charts.js does
// (services/agent/internal/tools/website/defaults/hark-charts.js).
function parseCSV(text) {
  var rows = []
  var row = []
  var field = ''
  var quoted = false
  for (var i = 0; i < text.length; i++) {
    var ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') field += ch
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  var head = rows.shift() || []
  return rows.map(function (r) {
    var o = {}
    head.forEach(function (name, j) {
      o[name.trim()] = typed(r[j])
    })
    return o
  })
}

function typed(cell) {
  var s = (cell == null ? '' : cell).trim()
  if (s === '') return null
  return isNaN(s) ? s : Number(s)
}

function readData(id) {
  var el = document.getElementById(id)
  if (!el) throw new Error('Hark.data: no element with id ' + id)
  return el.type === 'text/csv' ? parseCSV(el.textContent.trim()) : JSON.parse(el.textContent)
}

var hark = (window.Hark = window.Hark || {})
hark.safeHref = safeHref
hark.app = {
  load: function () {
    return callApp(LOAD, {})
  },
  run: function (action, input) {
    var fields = { action: String(action) }
    if (input !== undefined) fields.input = input
    return callApp(RUN, fields)
  },
}
if (typeof hark.data !== 'function') hark.data = readData
// shareLink is the page's link on the app, which opens only for readers the
// app admits; the page's own address carries the preview token the app framed
// it with. Its name must equal the one prompts/website_builder/v1.tmpl gives.
if (meta.share) hark.shareLink = meta.share

document.addEventListener('click', onClick, true)
window.addEventListener('message', onAppMessage)
new MutationObserver(function (records) {
  records.forEach(function (r) {
    if (r.type === 'attributes') revealWithin(r.target)
    else r.addedNodes.forEach(revealWithin)
  })
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: [ACTION, ITEM],
})
// The observer sees nodes added after this point; the parse may already have
// added some, and not every engine reports parser insertions to it.
revealWithin(document.documentElement)
document.addEventListener('DOMContentLoaded', function () {
  revealWithin(document.documentElement)
})
// A page no app frames, or one framed by anything but the app, is never
// answered, so it shows no buttons.
if (meta.app && window.parent !== window) {
  window.parent.postMessage({ type: HELLO }, new URL(meta.app).origin)
}

})();