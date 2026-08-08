from pathlib import Path
import os

base = Path('races')
for path in sorted(base.glob('202606*-*M-Messiah_All_Comers_Meet-Grantham-PA.html')):
    new_name = path.name
    if '-400M-' in new_name:
        new_name = new_name.replace('-400M-Messiah_All_Comers_Meet-Grantham-PA.html', '-400M-Messiah_All_Comers_Meet_400M-Grantham-PA.html')
    elif '-800M-' in new_name:
        new_name = new_name.replace('-800M-Messiah_All_Comers_Meet-Grantham-PA.html', '-800M-Messiah_All_Comers_Meet_800M-Grantham-PA.html')
    elif '-1600M-' in new_name:
        new_name = new_name.replace('-1600M-Messiah_All_Comers_Meet-Grantham-PA.html', '-1600M-Messiah_All_Comers_Meet_1600M-Grantham-PA.html')
    else:
        continue
    new_path = path.with_name(new_name)
    if path != new_path:
        os.replace(path, new_path)
        print(f'{path.name} -> {new_path.name}')
