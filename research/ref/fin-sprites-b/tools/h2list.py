import json
ids=open('/workspace/work/fsb/ids_sorted.txt').read().split()
h2=ids[252:]
HOR=set("06OeGk5Iu-s 4XV3SBMQgXE BYg7rV53WrM JUlTxosCXuk Ji7frCIfmAQ PDCuJf3SdRY PGBHL6Nc4X0 U67wZoy-1fE _Kx4ChHuCgI amA3ARfEoU8 byhq5v6BUWg d9oDfmcMJvA epzU65ZEdcs gHAmif0TenY lpqVYTH9U-A mwv48BWl2DY mymJwfSPeFA ndbf05-bvgQ s2WDIfvefEk vPEVQgvjoL4 xp6Pr-rB4JA xvibqyL-CqQ".split())
D3=set("CxtttdnwNWk 1_FSHqyc904 F0nfkeR-QEg FxpWhTj2Cv4 I07GcHQtY2o M0Nr98Axpo8 ehlf0_asIKo onr_ABfEMGk pPQDMtvu5rk w4L_Obw74dE wwVvGHfEfPI dKBSZUzVQ1E jXOg1Py4EoA EqOwqolOZOo tm24Uq9nlBc OFtVdbxJI2Y d8pJkdxtXAA SMOXF1bSsDk sGXmiyvZDE4 iqfHW2_sMmc zDFsnRE_Gig xlErokL2-4c CONozr99agQ xvlHij1tgk8 IbRrzKtieqs".split())
D3|=set("Nz2A-g73_iM PszkLYudcws".split()); HOR|=set(["icm-scp4975"])
import subprocess
D3|=set(subprocess.run("cd /workspace/work/fin2_fx_b/rebuild/app && grep -rl 'view3d\\|scene3d' data/modes | sed 's#.*/##;s/[.]js//'",shell=True,capture_output=True,text=True).stdout.split())
SKIP=HOR|D3
H2=[i for i in h2 if i not in SKIP]
