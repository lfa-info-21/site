texte=input()
if " " in texte:
    texte=texte.replace(" ", "")
elements = set(list(texte))
analyse = []

for i in elements:
    analyse.append([i,texte.count(i),round((texte.count(i)*100)/len(texte),2)])
print(list(reversed(sorted(analyse,key=lambda x:x[1]))))

            
