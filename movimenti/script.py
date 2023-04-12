f = open('movimenti/movimentiMani/movimenti.txt', 'r')
content = ''

for line in f.readlines():
    if 'index' in line:
        line = line[14:]
    content += line.strip() + '\n'

f.close()
f = open('movimenti/movimentiMani/movimenti.txt', 'w')
f.write(content)
f.close()