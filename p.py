from bs4 import BeautifulSoup
import csv
import requests

output_file = open('andhra',"w")
output = csv.writer(output_file)

url = 'http://trai.gov.in/comments/20-April/20-April.html'

r = requests.get(url)

soup = BeautifulSoup(r.content)

raw_rows = soup.find_all('tr')

for raw_row in raw_rows:
    clean_row = [] 
    for cell in raw_row.find_all('td'):
        value = cell.text.strip().encode('utf-8')

        if value:
            clean_row.append(value)
        check = cell.find('a')

        if check:
            bull = check["href"]
            urlnew = "http://trai.gov.in/comments/20-April/"+bull
            q = requests.get(urlnew)
            page2 = BeautifulSoup(q.content)
            text = page2.find('body').text.strip().encode('utf-8')
            clean_row.append(text)
        else:
            clean_row.append(' ')

    output.writerow(clean_row)
    output_file.flush()

output_file.close()