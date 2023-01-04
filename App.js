const ws = new require('ws');
const wsServer = new ws.Server({ port: 1919 })
// вешаем обработчик событий
const newUsers = [];
const allColors = ["black", "red", "green", "blue", "yellow", "white"];
const clients = []

wsServer.on("connection", (newClient) => {
  clients.push(newClient)

  clients.forEach(client => {
    if (client !== newClient) client.send("К нам присоединился новый игрок")
  })
  newClient.on('message', data => { // входящие сообщения - обработка
    const message = JSON.parse(data);
    console.log('ws data income', message)

    if (message.newUser) {
      const newUserData = {
        newUserName: message.newUser,
        position: {y:0, x:newUsers.length},
        color: allColors[newUsers.length]
      }
      newUsers.push(newUserData);

      clients.forEach(client => {
        client.send(JSON.stringify(newUsers));
        console.log("From server - All users", newUsers)
      })
    }
    if (message.move) {
      console.log("move");

      // sending move message to others
      clients.forEach(client => {
        if (client !== newClient) client.send(JSON.stringify(message))
      });

      // writing move of this user into server DB
      newUsers.forEach( user => {
        if (user.color === message.color) user.position = message.move;
      })
    }
  })
})

