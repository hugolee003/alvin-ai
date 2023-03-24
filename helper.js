const { store } = require("./store");

/**
 *
 * @param {any} request - The request from the user, usually a number
 * @param {*} data - The session data
 * @returns
 */
exports.getResponse = (request, data) => {
  if (isNaN(request)) {
    return "Invalid request";
  }

  const option = parseInt(request);

  // const data = data || {};
  if (data?.currentOrder && Array.isArray(data.currentOrder)) {
    // There is an order in progress instead
    const [handled, ...response] = addToOrder(request, data);
    if (handled) {
      return response;
    }
  }

  switch (option) {
    case 1:
      return placeAnOrder(data);
    case 99:
      return checkOutOrder(data);
    case 98:
      return orderHistory(data);
    case 97:
      return getCurrentOrder(data);
    case 0:
      return cancelOrder(data);
        case 2:
        case 3:
        case 4:
        case 5:
          return addToOrder(request, data);
    default:
      return [data];
  }
};

const getMenu = (data) => {
  let text = "";
  for (const item of store) {
    text += `${item.id}. ${item.name} - ${item.price} \n`;
  }
  return [text, data];
};

const placeAnOrder = (data) => {
  // data.currentOrder = [];
  // const menu = getMenu(data)[0]
  // return ["Please select an item\n" + menu, data];
  let response = "Please select an item by entering the item number:\n";

  store.forEach((item) => {
    response += `${item.id}. ${item.name} - ₦${item.price}\n`;
  });
  return [response, { step: "selecting_item", order: [] }];
};

// add new order
const addToOrder = (request, data) => {
  const item = store.find((item) => item.id === parseInt(request));
  if (!item) {
    return [false, "Invalid item", data];
  }

  if (!data.currentOrder) {
    data.currentOrder = [];
  }

  data.currentOrder.push(item);

  return ["Item added to order", data];
};

// checkout order
const checkOutOrder = (data) => {
  if (!data.currentOrder || !data.currentOrder.length) {
    return ["No order in progress", data];
  }

  let text = "Your order is: \n";
  let total = 0;
  for (const item of data.currentOrder) {
    text += `${item.name} - ${item.price} \n`;
    total += item.price;
  }
  text += `Total: ${total}`;
  
  // clear currentOrder property
  data.currentOrder = [];

  return [text, data];
};


// cancel the order
const cancelOrder = (data) => {
  if (!data.order || !data.order.length) {
    return ["No order to cancel", data];
  }

  data.order = [];
  data.step = "start";
  return ["Order cancelled", data];
};

function orderHistory(data) {
  if (!data.orders || data.orders.length === 0) {
    return ["No orders have been placed yet.", data];
  } else {
    let response = "Here is a list of all placed orders:\n";
    data.orders.forEach((order, index) => {
      response += `${index + 1}. `;
      order.forEach((item) => {
        response += `${item.name} - ${item.price}, `;
      });
      response = response.slice(0, -2); // remove the trailing comma and space
      response += "\n";
    });
    return [response, data];
  }
}


function getCurrentOrder(data) {
  if (!data.orders || data.orders.length === 0) {
    return ["No orders have been placed yet.", data];
  } else {
    const lastOrder = data.orders[data.orders.length - 1];
    let order = `Your current order (placed on ${lastOrder.date}): \n`;
    let total = 0;

    for (const item of lastOrder.items) {
      order += `${item.name} - ${item.price} \n`;
      total += item.price;
    }
    order += `Total: ${total}`;
    return [order, data];
  }
}
