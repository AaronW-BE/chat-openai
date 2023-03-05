let messages = {};

module.exports = {
  add(key, value) {
    if (!messages[key]) {
      messages[key] = [];
    }
    messages[key].push({
      content: value,
      time: Date.now(),
    })
  },
  remove(key) {
    if (messages[key]) {
      messages[key] = [];
    }
  },
  get(key) {
    return messages[key] || [];
  },
  all() {
    return messages
  },
}
