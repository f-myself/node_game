console.log('Hello, Nodejs');

var http = require('http'); // либа для запуска http-server
var url = require('url'); // Парсер URL
var fs = require('fs'); // Либа для работы с файловой системой

var server = new http.Server(); //Создание HTTP сервера
server.listen('5000'); // Определяем порт, на котором будет работать сервер

server.on('request', (request, response) => { // request - аналог $_SERVER, то, что получаем; response - то, что отправляем
    
    fs.readFile('./index.html', (error, data) => { // Асинхронная ф-ция по считыванию файла. 1 п-р: путь к файлу, 2й п-р: callback ф-ция
        
        response.end(data); // обязательно возвращаем ответ клиенту
    });
    
})


////////////////////////// HTTP END //////////////////////////

var randomсolor = require('randomcolor'); // рандомный цвет
var ws = require('ws'); // подключаем webSocket

var wsServer = new ws.Server({
    port: '5555' // Указываем порт для WS
});

var counter = 0;
var players = {};
//Ожидание клиента
wsServer.on('connection', (client) => {
    var id = counter++;
    var player = {
        id: id,
        color: randomсolor(),
        position: {
            top: 0,
            left: 0
        }
    };

    players[id] = player;

    var all_players_json = JSON.stringify({
        type: "all_players",
        info: players
    })
    client.send(all_players_json);

    wsServer.clients.forEach((cl) => {
        var message = {
            type: 'new_player',
            info: player
        };
        var message_json_string = JSON.stringify(message);
        cl.send(message_json_string);
    });

    // Событие отключения клиента
    client.on('close', () => {
        delete players[id];
        // Сообщение всем клиентам об удалении
        wsServer.clients.forEach((cl) => {
            var message = {
                type: 'remove_player',
                info: id
            };
            var message_json_string = JSON.stringify(message);
            cl.send(message_json_string);
        });
    })
    
    // Ожидание сообщения от клиента
    client.on('message', (message) => {
        if(message === 'ping') {
            // Ответ клиенту
            client.send('pong');
        }
        try {
            var data = JSON.parse(message);

            switch(data.type) {
                case "move":
                    switch(data.info) {
                        case "Up":
                            players[id].position.top--;
                            break;
                        case "Down":
                            players[id].position.top++;
                            break;
                        case "Left":
                            players[id].position.left--;
                            break;
                        case "Right":
                            players[id].position.left++;
                            break;
                    }

                    wsServer.clients.forEach((cl) => {
                        var data_json = JSON.stringify({
                            type: 'update_player',
                            info: players[id]
                        })
                        cl.send(data_json);
                    })

                    break;
            }
        } catch (e) {}
    })
})