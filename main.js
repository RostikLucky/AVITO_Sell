//////////////////////////
//                      //
//       AVITO69        //
//                      //
//////////////////////////
/// npm init
const fs = require('fs');
const fetch = require('node-fetch'); /// npm i --save node-fetch@2
const sqlite3 = require('sqlite3').verbose(); /// npm i --save-dev sqlite3
var TelegramBot = require('node-telegram-bot-api'); /// npm i --save node-telegram-bot-api

text_messages = {
  'main': {'text': '💼 *Бот по скупке Авито аккаунтов*\n -  Один аккаунт *(?) рублей*\n -  Проверка в течении *3-х дней*\n -  Быстрые выплаты на *QIWI* кошелек\nВы можете загрузить *(?) из (?)* аккаунтов!\nСчетчик обновляется раз в *(?):00 по МСК*', 'buttons': [[{text: '⬆️ Загрузить аккаунт', callback_data: 'uploadAccount'}, {text: 'ℹ️ Ваша информация', callback_data: 'myInfo'}], [{text: '🌐 Инструкция по регистрации', url: 'https://teletype.in/@rostiklucky/hGBNXoDfW5d'}], [{text: '🥝 Выплаты пользователям', url: 'https://teletype.in/@rostiklucky/hGBNXoDfW5d#cRGv'}]]},
  /// Загрузка аккаунтов
  'uploadAccount': {'text': '📄 *Отправьте sessid от аккаунта Авито*\nТребования для аккаунта:\n -  Русское имя в профиле\n -  Привязан номер телефона\n -  Привязана и подтверждена почта', 'buttons': [[{text: '🌐 Где найти sessid?', url: 'https://teletype.in/@rostiklucky/hGBNXoDfW5d#ZYBq'}], [{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'uploadAccountError_1': {'text': '❗️ *Вы доппустили ошибку при вводе!*', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'uploadAccount'}]]},
  'uploadAccountError_2': {'text': '❗️ *Достигнут лимит на загрузку* аккаунтов в день, попробуйте позже!', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'uploadAccountCheck': {'text': '📄 *Идёт проверка аккаунта!*', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'uploadAccount'}]]},
  'uploadAccountInfo': {'text': '📄 *Результат проверки аккаунта:*\n(?)', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'uploadAccount'}]]},
  /// Информация о пользователе
  'myInfo': {'text': '👤 *Ваша информация / статистика*\n -  Доступный баланс: *(?)₽*\n -  Загружено аккаунтов: *(?)* шт.\n -  Замороженный баланс: *(?)₽*\n -  Не проверено аккаунтов: *(?)* шт.', 'buttons': [[{text: '💰 Заказать выплату', callback_data: 'getCashout'}, {text: '📑 Скачать аккаунты', callback_data: 'downloadMyAccounts'}], [{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'downloadMyAccounts': {'text': '📑 *Идёт загрузка, ожидайте!*', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'resulAccountsCheck': {'text': '📑 *Ваши аккаунты были проверены!*\n -  Валидных: *(?)* шт.\n -  В блокировке: *(?)* шт.\n -  Невалидных: *(?)* шт.\n -  Разморожено: *(?)₽*\n -  Вычтено из заморозки: *(?)₽*\n*Вы можете дальше использовать эти аккаунты!*', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'getCashout': {'text': '💰 *Заказать выплату*\n(?)', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'errorCashout': {'text': '❗️ Вы *ошиблись при вводе* номера QIWI кошелька!', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'getCashout'}]]},
  'goodCashout': {'text': '💰 *Выплата заказана!*\n  - Все заявки обрабатываются в *течении 1-3 рабочих дней!*', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  /// Admin панель
  'downloadAccounts': {'text': '📑 *Отправьте количество аккаунтов*, которое необходимо скачать.\nДоступно *(?)* для скачивания!', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'checkAllAccounts': {'text': '📑 *Отправьте .txt файл* с проверенными аккаунтами!', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'checkAllAccountsInfo': {'text': '📑 *Статистика проверки аккаунтов:*\n -  Количество строк: *(?)* шт.\n -  Неивестных строк: *(?)* шт.\n\n -  Валидных аккаунтов: *(?)* шт.\n -  Невалидных аккаунтов: *(?)* шт.\n -  Общий баланс разморозки: *(?)₽*\n -  Количество пользователей: *(?)*\n*Ожидайте сообщения от бота*', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'botInfo': {'text': '💼 *Статистика бота*\n -  Пользователей в боте: *(?)* человек\n -  Общий баланс пользователей: *(?)₽*\n -  Общий замороженный баланс: *(?)₽*\n -  Ожидает выплаты *(?)* человек\n\n -  Всего загружено аккаунтов: *(?)* шт.\n -  Не проверено аккаунтов: *(?)* шт.', 'buttons': [[{text: '💰 Выплатить пользователям', callback_data: 'getCashoutUsers'}], [{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'getCashoutUsers': {'text': '💰 *Выплаты пользователям*\n(?)', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]},
  'botSendMessages': {'text': '🔤 *Команды управления*\n -  `/mess_all `[[сообщение]] - Рассылка всем пользователям\n -  `/info `[[ID пользователя]] - Информация о пользователе\n -  `/bd_downl` - Скачать актуальную базу данных\n -  `/score `[[число]] - Количество аккаунтов для загрузки', 'buttons': [[{text: '🏠 Вернуться обратно', callback_data: 'main'}]]}
}
debug = false;

//////////////////////////
//                      //
//     БАЗА ДАННЫХ      //
//                      //
//////////////////////////
function createDatabase() {
  db = new sqlite3.Database(process.cwd()+'/AVITO69.db', async (err) => {
    await db.exec(`
      create table usersInfo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userID INTEGER,
        firstName TEXT,
        userName TEXT,
        dateRegistration TEXT,
        balance INTEGER,
        frozenBalance INTEGER,
        uploatedAccounts INTEGER,
        checkedAccounts INTEGER,
        balanceCashout TEXT,
        lastMessageId INTEGER,
        lastAction TEXT,
        status TEXT
      );

      create table accountsInfo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userUploatedID INTEGER,
        dateAddAccount TEXT,
        priceAccount INTEGER,
        accountName TEXT,
        accountNumber TEXT,
        accountEmail TEXT,
        accountURL TEXT,
        sessid TEXT,
        status TEXT
      );

      create table botInfo (
        maxAccountsUploatedDay INTEGER,
        scoreAccountsUploated INTEGER,
        scoreLastUpdateDate INTEGER,
        timeClearAccountsUploated INTEGER,
        accountPrice INTEGER
      );
    `);
    await db.run(`INSERT INTO botInfo (maxAccountsUploatedDay, scoreAccountsUploated, scoreLastUpdateDate, timeClearAccountsUploated, accountPrice) VALUES (?,?,?,?,?)`, [20, 0, new Date().getDate() - 1, 21, 7],function(err,rows){});
    openDatabase();
  })
}

async function db_all(query) {
  return new Promise(function(resolve,reject) {
    db.all(query, function(err,rows) {
      if (err) return reject(err);
      resolve(rows);
    })
  })
}

function openDatabase() {
  db = new sqlite3.Database(process.cwd()+'/AVITO69.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) createDatabase();
    else mainMenu();
  })
}
openDatabase();

//////////////////////////
//                      //
//  ВЫПОЛНЕНИЕ ЗАПРОСА  //
//                      //
//////////////////////////
async function fetch_request(url, method, headers, body, type, useragent) {
  function jsonConcat(o1, o2) {
    for (var key in o2) o1[key] = o2[key];
    return o1;
  }
  value = {"status": "error", "data": "invalid_request"};
  fetch_data = {
    method: method,
    headers: jsonConcat({
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5,tr;q=0.4',
      'x-requested-with': 'XMLHttpRequest',
      'user-agent': useragent
    }, headers)
  }
  if (method == "POST") fetch_data["body"] = body;
  await fetch(url, fetch_data).then(function(data) {
    if (type == "text") return data.text();
    else if (type == "json") return data.json();
  }).then(function(data) {
    value = {"status": "success", "data": data};
  }).catch(function(data){
    data = data.toString();
    if (data.indexOf("Failed to fetch") != -1) value = {"status": "error", "data": "invalid_url"};
    else if (data.indexOf("SyntaxError") != -1) value = {"status": "error", "data": "invalid_request"};
    else value = {"status": "error", "data": data};
  });
  return value;
}

///////////////////////////
//                       //
//  ОТПРАВИТЬ СООБЩЕНИЕ  //
//                       //
///////////////////////////
async function sendMessage(chatId, messageId, action, userStatus, data='') {
  if (action !== undefined) {
    try {
      message_text = text_messages[action].text;
      message_buttons = text_messages[action].buttons;
    } catch (err) {
      message_text = message_buttons = '';
    }
    textEdit = buttonsEdit = [];
    /// Главное меню
    if (action == 'main') {
      row = await db_all(`SELECT maxAccountsUploatedDay, scoreAccountsUploated, scoreLastUpdateDate, timeClearAccountsUploated, accountPrice FROM botInfo`).then(function(row) {return row[0]});
      if (new Date().getHours() >= row.timeClearAccountsUploated && new Date().getDate() != row.scoreLastUpdateDate) await db.run("UPDATE botInfo SET scoreAccountsUploated=?, scoreLastUpdateDate=? WHERE scoreLastUpdateDate=?", [0, new Date().getDate(), row.scoreLastUpdateDate],function(err,rows){});
      textEdit = [row.accountPrice, row.maxAccountsUploatedDay - row.scoreAccountsUploated, row.maxAccountsUploatedDay, row.timeClearAccountsUploated];
      if (userStatus == 'admin') buttonsEdit = [[{text: '💾 Выгрузить аккаунты', callback_data: 'downloadAccounts'}, {text: '⬇️ Отправить аккаунты', callback_data: 'checkAllAccounts'}], [{text: 'ℹ️ Статистика бота', callback_data: 'botInfo'}], [{text: '🔤 Команды управления', callback_data: 'botSendMessages'}]];
    /// Моя информация
    } else if (action == 'myInfo') {
      row = await db_all(`SELECT balance, frozenBalance, uploatedAccounts, checkedAccounts FROM usersInfo WHERE userID = ${chatId}`).then(function(row) {return row[0]});
      textEdit = [row.balance, row.uploatedAccounts, row.frozenBalance, row.uploatedAccounts - row.checkedAccounts];
    /// Информация о загруженном аккаунте
    } else if (action == 'uploadAccountInfo') {
      if (data != '') textEdit = [data];
      else {
        action = 'uploadAccount';
        message_text = text_messages['uploadAccount'].text;
        message_buttons = text_messages['uploadAccount'].buttons;
      }
    /// Скачать загруженные аккаунты
    } else if (action == 'downloadMyAccounts') {
      createFile(chatId, 'myAccounts');
      return
    /// Скачать непроверенные аккаунты
    } else if (action == 'downloadAccounts') {
      row = await db_all(`SELECT id FROM accountsInfo WHERE status = 'Не проверен'`).then(function(row) {return row});
      textEdit = [row.length];
    /// Информация о проверенных аккаунтах / Сообщение пользователю о проверенных аккаунтах
    } else if (action == 'checkAllAccountsInfo' || action == 'resulAccountsCheck') {
      if (data != '') textEdit = data;
      else {
        action = 'uploadAccount';
        message_text = text_messages['uploadAccount'].text;
        message_buttons = text_messages['uploadAccount'].buttons;
      }
    /// Статистика бота
    } else if (action == 'botInfo' && userStatus == 'admin') {
      row = await db_all(`SELECT balance, frozenBalance, uploatedAccounts, checkedAccounts, balanceCashout FROM usersInfo`).then(function(row) {return row});
      allBalance = 0;
      allFrozenbalance = 0;
      cashOutInfo = 0;
      countAccount = 0;
      noCheckAccount = 0;
      for (var i = 0; i < row.length; i++) {
        allBalance += row[i].balance;
        allFrozenbalance += row[i].frozenBalance;
        if (row[i].balanceCashout.indexOf('Ожидает') != -1) cashOutInfo += 1
        countAccount += row[i].uploatedAccounts;
        noCheckAccount += row[i].checkedAccounts;
      }
      textEdit = [row.length, allBalance, allFrozenbalance, cashOutInfo, countAccount, countAccount - noCheckAccount];
    /// Заказать выплату
    } else if (action == 'getCashout') {
      row = await db_all(`SELECT balance FROM usersInfo WHERE userID = ${chatId}`).then(function(row) {return row[0]});
      if (row.balance > 0) textEdit = [' -  Отправьте номер QIWI кошелька для выплаты!'];
      else textEdit = [' -  У вас недостаточно средств для вывода!'];
    /// Выплаты пользователям
    } else if (action == 'getCashoutUsers' && userStatus == 'admin') {
      row = await db_all(`SELECT userID, firstName, userName, balanceCashout FROM usersInfo WHERE instr(\`balanceCashout\`, 'Ожидает') != 0 LIMIT 1`).then(function(row) {return row});
      if (row.length == 0) textEdit = [' -  Нет заказанных выплат!'];
      else {
        balanceCashout = row[0].balanceCashout.split('] ');
        for (var i = 0; i < balanceCashout.length; i++) {
          if (balanceCashout[i].indexOf('Ожидает') != -1) {
            balanceCashout = balanceCashout[i];
            break
          }
        }
        countCashout = balanceCashout.split('[')[0];
        cashoutId = balanceCashout.split('[')[1].split(']')[0];
        wallet = balanceCashout.split('[')[2].split(']')[0];
        date = balanceCashout.split('[')[4].split(']')[0].split('GMT')[0];
        textEdit = [` -  Пользователь: [${row[0].firstName.replaceAll('_', '-')}](tg://user?id=${row[0].userID})\n -  Ник-нейм: @${row[0].userName.replaceAll('_', '-')}\n -  Сумма выплаты: \`${countCashout}\`₽\n -  QIWI Кошелёк: \`${wallet}\`\n -  Дата: ${date}`];
        buttonsEdit = [[{text: '👌 Подтвердить выплату', callback_data: `сashoutUsers`}], [{text: '❌ Отменить выплату', callback_data: `cancelCashoutUsers`}]];
      }
    }

    /// Отправить сообщение
    if (message_text != '') {
      for (var i = 0; i < textEdit.length; i++) {message_text = message_text.replace('(?)', textEdit[i])}
      message_buttons = buttonsEdit.concat(message_buttons);
      await telegramBot.editMessageCaption(message_text, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {inline_keyboard: message_buttons}, 
        parse_mode: 'Markdown'
      }).then(function(msg){
        db.run("UPDATE usersInfo SET lastAction=? WHERE userId=?", [action, chatId],function(err,rows){});
      }).catch(async function(err){
        if (err.toString().indexOf('Bad Request: message is not modified') == -1) {
          await telegramBot.sendPhoto(chatId, "https://tg.goh.su/AVITO69/main2.jpg", {
            caption: message_text, 
            reply_markup: {inline_keyboard: message_buttons}, 
            parse_mode: 'Markdown'
          }).then(function(msg){
            db.run("UPDATE usersInfo SET lastAction=?, lastMessageId=? WHERE userId=?", [action, msg.message_id, chatId],function(err,rows){});
          }).catch(function(err){console.log(`Ошибка при отправке сообщения {'chatId': ${chatId}, 'messageId': ${messageId}, 'action': '${action}', 'message': '${message_text}', 'err': '${err.toString()}'}`)});
        }
      })
    }
  }
}

//////////////////////////
//                      //
//  ПРОВЕРИТЬ АККАУНТ   //
//                      //
//////////////////////////
function checkAccount(chatId, messageId, sessid) {
  fetch_request(`https://m.avito.ru/api/13/profile/info?key=af0deccbgcgidddjgnvljitntccdduijhdinfgjgfjir`, "GET", {'cookie': `sessid=${sessid}`}, "{}", "json", "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36").then(async function(request){
    if (request.status == "success") {
      data = request.data;
      if (data.status == 'ok') {
        if (data.result.sharing !== undefined) {
          user_url = data.result.sharing.text
          if (data.result.elements[1].body.name !== undefined) user_name = data.result.elements[1].body.name;
          else user_name = "";
          if (data.result.elements[1].body.email !== undefined) user_email = data.result.elements[1].body.email;
          else user_email = "";
          if (data.result.elements[1].body.phone !== undefined) user_phone = data.result.elements[1].body.phone.replaceAll("-", "").replaceAll(" ", "");
          else user_phone = "";
          if (user_email != "") {
            if (user_phone != "") {
              rowInfo = await db_all(`SELECT accountURL FROM accountsInfo WHERE accountURL = '${user_url}'`).then(function(row) {return row});
              if (rowInfo.length == 0) {
                row = await db_all(`SELECT scoreAccountsUploated, accountPrice FROM botInfo`).then(function(row) {return row[0]});
                await db.run(`INSERT INTO accountsInfo (userUploatedID, dateAddAccount, priceAccount, accountName, accountNumber, accountEmail, accountURL, sessid, status) VALUES (?,?,?,?,?,?,?,?,?)`, [chatId, new Date().toString(), row.accountPrice, user_name, user_phone, user_email, user_url, sessid, 'Не проверен'],function(err,rows){});
                await db.run("UPDATE botInfo SET scoreAccountsUploated=? WHERE scoreAccountsUploated=?", [row.scoreAccountsUploated + 1, row.scoreAccountsUploated],function(err,rows){});
                await db.run(`UPDATE usersInfo SET frozenBalance = frozenBalance + ${row.accountPrice}, uploatedAccounts = uploatedAccounts + 1 WHERE userID=?`, [chatId],function(err,rows){});
                sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ` -  Имя аккаунта: \`${user_name}\`\n -  Номер телефона: \`${user_phone}\`\n -  Оплата: *${row.accountPrice} рублей*\nВаши средства будут разморожены *в течении 3-х дней*!`);
              } else sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ' -  Данный аккаунт уже *есть в базе данных*!');
            } else sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ' -  У аккаунта *отсутствует номер телефона* или номер не подтверждён!');
          } else sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ' -  У аккаунта *отсутствует почта* или она не подтверждена!');
        } else {sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ' -  *Не удалось войти*, проверьте свой аккаунт!'); console.log(JSON.stringify(data))}
      } else {sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ` -  *Не удалось войти!*\n${data.result.message}, проверьте свой аккаунт!`); console.log(JSON.stringify(data))}
    } else sendMessage(chatId, messageId, 'uploadAccountInfo', 'user', ' -  *Ошибка сервера*, попробуйте позже!');
  })
}

//////////////////////////
//                      //
//     СОЗДАТЬ ФАЙЛ     //
//                      //
//////////////////////////
async function createFile(chatId, type, limit=0) {
  /// Аккаунты для пользователя
  if (type == 'myAccounts') {
    text = 'Ваши аккаунты:\n';
    row = await db_all(`SELECT accountName, accountNumber, accountEmail, sessid, status FROM accountsInfo WHERE userUploatedID = ${chatId}`).then(function(row) {return row});
    for (var i = 0; i < row.length; i++) {
      text = text + `Аккаунт: ${row[i].accountName}, номер: ${row[i].accountNumber}, почта: ${row[i].accountEmail}, sessid: ${row[i].sessid}, статус: ${row[i].status}\n`;
    }
  }
  randomName = process.cwd()+`/GOH_AVITO69_${Math.random().toString().substr(2, 8)}.txt`;
  fs.writeFile(randomName, text, function(err) {
    if (!err) {
      today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0');
      telegramBot.sendDocument(chatId, fs.readFileSync(randomName), {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}}, {
        'type': 'text',
        'filename': `Аккаунты - ${dd}.${mm}.txt`,
        'contentType': 'text/txt'
      }).then(function(msg){
        fs.unlinkSync(randomName);
      }).catch(function(err){
        fs.unlinkSync(randomName);
        console.log("Ошибка при создании файла #1")
      })
    }
  });
}

//////////////////////////
//                      //
//      ОБРАБОТКА       //
//                      //
//////////////////////////
async function addUser(msg) {
  row = await db_all(`SELECT lastMessageId, lastAction, status FROM usersInfo WHERE userID = ${msg.from.id}`).then(function(row) {return row});
  if (row.length == 0) {
    await db.run(`INSERT INTO usersInfo (userID, firstName, userName, dateRegistration, balance, frozenBalance, uploatedAccounts, checkedAccounts, balanceCashout, lastMessageId, lastAction, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`, [msg.from.id, msg.from.first_name, msg.from.username, new Date().toString(), 0, 0, 0, 0, '', 0, 'main', 'user'],function(err,rows){});
    return [0, 'main', 'user']
  } else return [row[0].lastMessageId, row[0].lastAction, row[0].status]
}

function mainMenu() {
  if (debug) TG_api = 'key';
  else TG_api = 'key';
  telegramBot = new TelegramBot(TG_api, {polling: true});
  /// Обработка сообщений от пользователя
  telegramBot.on('message', async function (msg) {
    value = await addUser(msg);
    ///////////////////////////
    //                       //
    //  ОБРАБОТКА СООБЩЕНИЙ  //
    //                       //
    ///////////////////////////
    if (msg.document === undefined) {
      /// Проверка загруженного аккаунта sessid
      if (value[1] == 'uploadAccount') {
        row = await db_all(`SELECT maxAccountsUploatedDay, scoreAccountsUploated FROM botInfo`).then(function(row) {return row[0]});
        if (row.maxAccountsUploatedDay != row.scoreAccountsUploated) {
          if (msg.text.length == 43 && msg.text.indexOf('.') != -1) {
            value[1] = 'uploadAccountCheck';
            checkAccount(msg.from.id, value[0], msg.text);
          } else value[1] = 'uploadAccountError_1';
        } else value[1] = 'uploadAccountError_2';
      /// Скачать аккаунты для проверки
      } else if (value[1] == 'downloadAccounts' && value[2] == 'admin') {
        if (!isNaN(Number(msg.text))) {
          row = await db_all(`SELECT sessid, id, userUploatedID, accountName FROM accountsInfo WHERE status = 'Не проверен' LIMIT ${Number(msg.text)}`).then(function(row) {return row});
          text = 'Аккаунты для проверки, ';
          for (var i = 0; i < row.length; i++) {
            await db.run(`UPDATE accountsInfo SET status = 'На проверке' WHERE id=?`, [row[i].id],function(err,rows){});
            text = text + `ID${row[i].id} ${row[i].accountName} ${row[i].userUploatedID}: ${row[i].sessid}, `;
          }
          await telegramBot.sendMessage(msg.from.id, text, {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown', disable_notification: true}).then(function(msg){}).catch(function(err){});
          await telegramBot.deleteMessage(msg.from.id, msg.message_id);
        }
        return
      /// Проверка номера для вывода
      } else if (value[1] == 'getCashout') {
        if (msg.text.length >= 11 && msg.text.length <= 14) {
          if (!isNaN(Number(msg.text))) {
            row = await db_all(`SELECT balance, balanceCashout FROM usersInfo WHERE userID = ${msg.from.id}`).then(function(row) {return row[0]});
            await db.run(`UPDATE usersInfo SET balance=?, balanceCashout=? WHERE userID=?`, [0, `${row.balanceCashout}${row.balance}[${Math.random().toString().substr(2, 8)}][${Number(msg.text)}][Ожидает выплаты][${new Date().toString()}] `,msg.from.id],function(err,rows){});
            value[1] = 'goodCashout';
            await telegramBot.sendMessage(313997284, `💸 *Заказана выплата* в размере ${row.balance}₽`, {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown', disable_notification: true}).then(function(msg){}).catch(function(err){});
          } else value[1] = 'errorCashout';
        } else value[1] = 'errorCashout';
      } else {
        ///////////////////////////
        //                       //
        //   ОБРАБОТКА КОМАНД    //
        //                       //
        ///////////////////////////
        if (msg.text !== undefined) {
          /// Рассылка всем пользователям
          if (msg.text.indexOf('/mess_all') != -1 && value[2] == 'admin') {
            rowsUser = await db_all(`SELECT userID FROM usersInfo`).then(function(row) {return row});
            good_mess = 0;
            false_mess = 0;
            for (var i = 0; i < rowsUser.length; i++) {
              await telegramBot.sendMessage(rowsUser[i].userID, msg.text.replace('/mess_all ', '📨 '), {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown', disable_notification: true}).then(function(msg){good_mess++}).catch(function(err){false_mess++});
              await new Promise(r => setTimeout(r, 200));
            }
            await telegramBot.sendMessage(msg.from.id, `📨 *Информация о рассылке:*\n -  Пользователей: *${rowsUser.length}* человек\n -  Отправлено: *${good_mess}* сообщений\n -  Не отправлено: *${false_mess}* сообщений`, {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown', disable_notification: true});
            await telegramBot.deleteMessage(msg.from.id, msg.message_id);
            return
          /// Информация о пользователе
          } else if (msg.text.indexOf('/info ') != -1 && value[2] == 'admin') {
            val = Number(msg.text.split('/info ')[1]);
            if (!isNaN(val)) {
              row = await db_all(`SELECT firstName, userName, dateRegistration, balance, frozenBalance, uploatedAccounts, checkedAccounts, balanceCashout, lastAction FROM usersInfo WHERE userID = ${val}`).then(function(row) {return row});
              if (row.length > 0) {
                row = row[0];
                balanceCashoutNum = 0;
                if (row.balanceCashout.indexOf('] ') != -1) {
                  balanceCashout = row.balanceCashout.split('] ');
                  for (var i = 0; i < balanceCashout.length; i++) {
                    balanceCashoutNum += Number(balanceCashout[i].split('[')[0]);
                  }
                }
                await telegramBot.sendMessage(msg.from.id, `👤 *Информация о пользователе:*\n -  Имя: \`${row.firstName.replaceAll('_', '-')}\`\n -  Ник-нейм: @${row.userName.replaceAll('_', '-')}\n -  Зарегистрирован: *${row.dateRegistration.split('GMT')[0]}*\n\n -  Баланс: *${row.balance}₽*\n -  Замороженный баланс: *${row.frozenBalance}₽*\n -  Выведено: *${balanceCashoutNum}₽*\n\n -  Загружено аккаунтов: *${row.uploatedAccounts}* шт.\n -  Не проверено аккаунтов: *${row.uploatedAccounts - row.checkedAccounts}* шт.\n -  Последнее действие: *${row.lastAction}*`, {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown'});
                await telegramBot.deleteMessage(msg.from.id, msg.message_id);
              }
            }
            return
          /// Скачать базу данных
          } else if (msg.text.indexOf('/bd_downl') != -1 && value[2] == 'admin') {
            telegramBot.sendDocument(msg.from.id, fs.readFileSync(process.cwd()+'/AVITO69.db'), {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}}, {
              'type': 'sql',
              'filename': `AVITO69.db`,
              'contentType': 'application/sql'
            }).then(function(msg){}).catch(function(err){console.log("Ошибка при создании файла #2")})
          /// Открыть окно с аккаунтами
          } else if (msg.text.indexOf('/downloadAccounts') != -1 && value[2] == 'admin') {
            value[1] = 'downloadAccounts';
          /// Изменить счётчик аккаунтов
          } else if (msg.text.indexOf('/score ') != -1 && value[2] == 'admin') {
            val = Number(msg.text.split('/score ')[1]);
            if (!isNaN(val)) await db.run(`UPDATE botInfo SET scoreAccountsUploated = maxAccountsUploatedDay - ?`, [val],function(err,rows){});
          /// Перезапустить бота
          } else if (msg.text.indexOf('/restart') != -1) value[0] = 0;
        }
      }
      sendMessage(msg.from.id, value[0], value[1], value[2]);
    ///////////////////////////
    //                       //
    //  ОБРАБОТКА ДОКУМЕНТА  //
    //                       //
    ///////////////////////////
    } else {
      /// Загрузка проверенных аккаунтов
      if (value[2] == 'admin' && value[1] == 'checkAllAccounts') {
        await telegramBot.downloadFile(msg.document.file_id, process.cwd()).then(function(filename) {
          /// Переменные со статистикой
          trueCheckedAccounts = 0;
          falseCheckedAccounts = 0;
          failedAccounts = 0;
          unFrozenBalance = 0;
          accountsInfo = {};
          /// Сортировка и проверка данных
          fs.readFile(filename, 'utf8', async function(err, data) {
            data = data.split("\n");
            for (var i = 0; i < data.length; i++) {
              if (data[i].indexOf('ID') != -1 && data[i].indexOf(' - ') != -1 && data[i].indexOf(': ') != -1) {
                accountUploatedID = data[i].split('ID')[1].split(': ')[0];
                accountSessid = data[i].split(': ')[1].split(' ')[0];
                workstationCount = Number(data[i].split(' - ')[1].split(' ')[0]);
                workstationStatus = data[i].split(' - ')[2];
                row = await db_all(`SELECT status, priceAccount, userUploatedID, sessid FROM accountsInfo WHERE id = ${accountUploatedID}`).then(function(row) {return row[0]});
                if (row.sessid == accountSessid && row.status == 'На проверке') {
                  if (workstationStatus.indexOf('В блокировке') != -1 || workstationStatus.indexOf('Активен') != -1 || workstationStatus.indexOf('Невалид') != -1) {
                    /// Выплатить пользователю
                    if (workstationCount >= 5) {
                      if (accountsInfo[row.userUploatedID] !== undefined) accountsInfo[row.userUploatedID]['data'] = `${accountsInfo[row.userUploatedID]['data']}, Отработал-${row.priceAccount}`;
                      else {accountsInfo[row.userUploatedID] = {'data': ''}; accountsInfo[row.userUploatedID]['data'] = `Отработал-${row.priceAccount}`}
                      trueCheckedAccounts++;
                      unFrozenBalance += row.priceAccount;
                      await db.run(`UPDATE accountsInfo SET status = 'Отработал' WHERE id=?`, [accountUploatedID],function(err,rows){});
                    /// Не выплачивать
                    } else {
                      if (accountsInfo[row.userUploatedID] !== undefined) accountsInfo[row.userUploatedID]['data'] = `${accountsInfo[row.userUploatedID]['data']}, ${workstationStatus}-${row.priceAccount}`;
                      else {accountsInfo[row.userUploatedID] = {'data': ''}; accountsInfo[row.userUploatedID]['data'] = `${workstationStatus}-${row.priceAccount}`}
                      unFrozenBalance += 0;
                      falseCheckedAccounts++;
                      await db.run(`UPDATE accountsInfo SET status=? WHERE id=?`, [workstationStatus, accountUploatedID],function(err,rows){});
                    }
                  } else failedAccounts++;
                } else failedAccounts++;
              } else failedAccounts++;
            }
            fs.unlinkSync(filename);
            /// Вывод данных
            await sendMessage(msg.from.id, value[0], 'checkAllAccountsInfo', value[2], [data.length, failedAccounts, trueCheckedAccounts, falseCheckedAccounts, unFrozenBalance, Object.keys(accountsInfo).length]);
            /// Рассылка и выплата пользователям
            await new Promise(r => setTimeout(r, 1500));
            for (var i = 0; i < Object.keys(accountsInfo).length; i++) {
              user = Object.keys(accountsInfo)[i];
              userData = accountsInfo[user]['data'].split(', ');
              trueCheckedAccounts = 0;
              blockCheckedAccounts = 0;
              nevalidCheckedAccounts = 0;
              unFrozenBalance = 0;
              clearFrozenBalance = 0;
              for (var i2 = 0; i2 < userData.length; i2++) {
                if (userData[i2].indexOf('Отработал-') != -1) {
                  trueCheckedAccounts++;
                  unFrozenBalance += Number(userData[i2].split('-')[1]);
                } else if (userData[i2].indexOf('В блокировке-') != -1) {
                  blockCheckedAccounts++;
                  unFrozenBalance += 0;
                  clearFrozenBalance += Number(userData[i2].split('-')[1]) - 0;
                } else if (userData[i2].indexOf('Невалид-') != -1) {
                  nevalidCheckedAccounts++;
                  unFrozenBalance += 0;
                  clearFrozenBalance += Number(userData[i2].split('-')[1]) - 0;
                }
              }
              await db.run(`UPDATE usersInfo SET balance = balance + ${unFrozenBalance}, frozenBalance = frozenBalance - ${clearFrozenBalance + unFrozenBalance}, checkedAccounts = checkedAccounts + ${userData.length} WHERE userID=?`, [Number(user)],function(err,rows){});
              await new Promise(r => setTimeout(r, 500));
              await sendMessage(Number(user), 0, 'resulAccountsCheck', value[2], [trueCheckedAccounts, blockCheckedAccounts, nevalidCheckedAccounts, unFrozenBalance, clearFrozenBalance]);
            }
            randomName = process.cwd()+`/GOH_AVITO69_${Math.random().toString().substr(2, 8)}.txt`;
            text = JSON.stringify(accountsInfo).replaceAll('":{', '":\n  {').replaceAll('"},"', '"},\n"').substring(1);
            fs.writeFile(randomName, text.substring(0, text.length - 1), function(err) {
              if (!err) {
                today = new Date();
                var dd = String(today.getDate()).padStart(2, '0');
                var mm = String(today.getMonth() + 1).padStart(2, '0');
                telegramBot.sendDocument(msg.from.id, fs.readFileSync(randomName), {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}}, {
                  'type': 'text',
                  'filename': `Проверка - ${dd}.${mm}.txt`,
                  'contentType': 'text/txt'
                }).then(function(msg){
                  fs.unlinkSync(randomName);
                }).catch(function(err){
                  fs.unlinkSync(randomName);
                  console.log("Ошибка при создании файла #3")
                })
              }
            });
          })
        })
      }
    }
    telegramBot.deleteMessage(msg.from.id, msg.message_id).then(function(msg){}).catch(function(err){console.log(`Ошибка при удалении сообщения {'chatId': ${msg.from.id}, 'messageId': ${msg.message_id}, 'action': '${value[1]}'}`)});
  });
  ///////////////////////////
  //                       //
  //   ОБРАБОТКА КНОПОК    //
  //                       //
  ///////////////////////////
  telegramBot.on('callback_query', async function (msg) {
    value = await addUser(msg);
    /// Подтвердить или отменить вывод средств
    if ((msg.data == 'сashoutUsers' || msg.data == 'cancelCashoutUsers') && value[2] == 'admin') {
      row = await db_all(`SELECT userID, balanceCashout, balance FROM usersInfo WHERE instr(\`balanceCashout\`, 'Ожидает') != 0 LIMIT 1`).then(function(row) {return row});
      if (row.length != 0) {
        if (row[0].balanceCashout.indexOf('Ожидает') != -1) {
          balance = row[0].balance;
          /// Выплатить
          if (msg.data == 'сashoutUsers') {
            balanceCashout = row[0].balanceCashout.replace('Ожидает выплаты', 'Выплачено');
            await telegramBot.sendMessage(row[0].userID, '💸 *Вам пришла выплата на QIWI кошелек!*', {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown'}).then(function(msg){}).catch(function(err){});
          /// Отменить выплату
          } else if (msg.data == 'cancelCashoutUsers') {
            balanceCashout = row[0].balanceCashout.split('] ');
            for (var i = 0; i < balanceCashout.length; i++) {
              if (balanceCashout[i].indexOf('Ожидает') != -1) {
                balanceCashout = balanceCashout[i];
                break
              }
            }
            balance = row[0].balance + Number(balanceCashout.split('[')[0]);
            balanceCashout = row[0].balanceCashout.replace('Ожидает выплаты', 'Выплата отменена');
            await telegramBot.sendMessage(row[0].userID, '💸 *Ваша выплата отменена!*\n  - Обратитесь к @RostikLucky за информацией', {reply_markup: {inline_keyboard: [[{text: '🗑 Удалить это сообщение', callback_data: 'deleteThis'}]]}, parse_mode: 'Markdown'}).then(function(msg){}).catch(function(err){});
          }
          await db.run(`UPDATE usersInfo SET balanceCashout=?, balance=? WHERE userID=?`, [balanceCashout, balance, row[0].userID],function(err,rows){});
          sendMessage(msg.from.id, value[0], 'getCashoutUsers', value[2]);
        }
      }
    } else {
      if (msg.data != 'deleteThis') sendMessage(msg.from.id, value[0], msg.data, value[2]);
      else telegramBot.deleteMessage(msg.from.id, msg.message.message_id).then(function(msg){}).catch(function(err){console.log(`Ошибка при удалении сообщения {'chatId': ${msg.from.id}, 'messageId': ${msg.message.message_id}}`)});
    }
    telegramBot.answerCallbackQuery(msg.id);
  });
}