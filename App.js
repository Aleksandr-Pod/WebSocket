const ws = new require('ws');
const wsServer = new ws.Server({ port: 1919 });

let users = [];
const usersLimit = 2;
// const userColors = ["black", "red", "green", "blue", "yellow", "white"];
const usersColors = { black: "", red: "", green: "", blue: "", yellow: "", white: "" };
const clients = [];

wsServer.on("connection", newClient => {
  // Проверка на лимит клиентов сервера ...
  // if (clients.length === clientsLimit) {
  //   newClient.send("users limit");
  //   console.log("users limit");
  //   return;
  // }
  newClient.id = Date.now();
  clients.push(newClient);

  newClient.send(JSON.stringify(users));// Кто уже в игре.
  // Проверяем связть каждые 5 сек
  // const ping = setInterval(() => newClient.send("--ping--"), 5000);
  
  // clients.forEach(client => {
  //   if (client !== newClient) client.send("К нам присоединился новый игрок")
  // })

  newClient.on('message', data => { // обработка входящих сообщений для каждого нового клиента
    const message = JSON.parse(data);
    // message: {
    //  newUser: "",
    //  exit: {userName: "", color: ""} 
    // }
  
    if (message.newUser) {
      // проверка на лимит юзеров ..
      if (users.length === usersLimit) {
        newClient.send(`users limit - ${usersLimit} persons`);
        return;
      }
      const newUserData = {
        newUserName: message.newUser,
        position: {y:0, x:0},
        color: getEmptyColor(message.newUser),
        timeout: 5
      }
      users.push(newUserData);
      console.log("users qtty:", users.length);

      clients.forEach(client => {
        client.send(JSON.stringify(users));
      })
    }

    if (message.exit) {
      const {userName, color} = message.exit;
      users = users.filter(user => user.color !== color);
      console.log(`user ${userName} leave, users in game: ${users.length}`);

      clients.forEach(client => {
        client.send(JSON.stringify({userLeft: userName}));
      });
    }

    if (message.move) {
      console.log("move", message);
      // sending move message to others
      clients.forEach(client => {
        if (client !== newClient) client.send(JSON.stringify(message))
      });
      // writing move of this user into server DB
      users.forEach( user => {
        if (user.color === message.color) user.position = message.move;
      })
    }

    if (message.pong) {
      users.forEach( user => {
        if (user.color === message.pong) {
          user.timeout -= 1;
          console.log(`user:${user.newUserName}, timeout: ${user.timeout}`);
          if (user.timeout === 0) removeClient(user.newUserName);
        }
      })
    }
  })
})

function removeUserFromUsers(name) {
  console.log('user disconnected !');
  users = users.filter(user => user.usersName !== name);
  setEmptyColor(name);
}
function removeClient (name) {
  // находим удаляемого клиента
  // exClient = clients.filter(client => client)
}
function getEmptyColor(userName) {
  const color = Object.keys(usersColors).find(el => usersColors[el] === "")
  usersColors[color] = userName;
  return color;
}
function setEmptyColor(userName) {
  const color = Object.keys(usersColors).find(el => usersColors[el] === userName)
  usersColors[color] = "";
}