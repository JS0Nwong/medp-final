const users = [];
const rooms = [];

console.log(users, rooms);

function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

//Get the current user
function getUser(id) {
  return users.find(user => user.id === id);
}

//Users leaves the chatroom
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if(index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//Get the room users
function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getUser,
    userLeave,
    getRoomUsers,
};