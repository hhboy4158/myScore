FROM node:20-alpine

WORKDIR /usr/src/app

# 複製依賴檔案並安裝
COPY package*.json ./
RUN npm install

# 複製專案其餘檔案
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["nodemon", "app.js"]
