/**
 * A handler that fires when a user drags over any element inside a column. In
 * order to determine which column the user is dragging over the entire event
 * bubble path is checked with `event.path` (or `event.composedPath()` for
 * browsers that don't support `event.path`). The bubbling path is looped over
 * until an element with a `data-area` attribute is found. Once found both the
 * active dragging column is set in the `state` object in "data.js" and the HTML
 * is updated to reflect the new column.
 *
 * @param {Event} event
 */

// Import necessary functions and objects from view.js and data.js
import {
  html,
  updateDraggingHtml,
  createOrderHtml,
  moveToColumn,
} from "./view.js";
import { createOrderData, state } from "./data.js";

const handleDragOver = (event) => {
  event.preventDefault();
  const path = event.path || event.composedPath();
  let column = null;

  for (const element of path) {
    const { area } = element.dataset;
    if (area) {
      column = area;
      break;
    }
  }

  if (!column) return;
  updateDragging({ over: column });
  updateDraggingHtml({ over: column });
};

const handleDragStart = (event) => {
  const orderId = event.target.dataset.id;
  if (!orderId) return;

  event.dataTransfer.setData("text/plain", orderId);
};
const handleDragEnd = (event) => {
  // Reset the background color of all columns
  updateDraggingHtml({ over: null });

  // Get the dragged order ID from the data transfer
  const orderId = event.dataTransfer.getData("text/plain");

  // Get the new column where the order was dropped
  const newColumn = state.dragging.over;

  // Check if a valid newColumn exists and it's different from the source column
  if (newColumn && newColumn !== state.orders[orderId].column) {
    // Update the order's column in the state
    state.orders[orderId].column = newColumn;

    // Move the order to the new column in the DOM
    moveToColumn(orderId, newColumn);

    // You can also perform any additional actions here if needed
    // For example, send an API request to update the order's status on the server
  }
};
const handleHelpToggle = (event) => {
  html.help.overlay.classList.toggle("open");
};
const handleAddToggle = (event) => {
  html.add.overlay.classList.toggle("open");
};
const handleAddSubmit = (event) => {
  event.preventDefault();

  // Get the values from the form
  const title = html.add.title.value;
  const table = html.add.table.value;

  // Create a new order object
  const newOrder = createOrderData({ title, table, column: "ordered" });

  // Update the state with the new order
  state.orders[newOrder.id] = newOrder;

  // Create the HTML element for the new order and append it to the 'ordered' column
  const orderHtml = createOrderHtml(newOrder);
  html.columns.ordered.appendChild(orderHtml);

  // Clear the form and close the overlay
  html.add.title.value = "";
  html.add.table.value = "";
  html.add.overlay.classList.remove("open");
};
const handleEditToggle = (event) => {
  const orderId = event.target.dataset.id;
  if (!orderId) return;

  const order = state.orders[orderId];

  if (!order) return;

  html.edit.overlay.classList.toggle("open");

  // Populate the edit form with order details
  html.edit.title.value = order.title;
  html.edit.table.value = order.table;
  html.edit.id.value = order.id;
  html.edit.column.value = order.column;
};
const handleEditSubmit = (event) => {
  event.preventDefault();

  // Get the values from the form
  const title = html.edit.title.value;
  const table = html.edit.table.value;
  const id = html.edit.id.value;
  const column = html.edit.column.value;

  // Update the order object in the state with the new values
  state.orders[id].title = title;
  state.orders[id].table = table;
  state.orders[id].column = column;

  // Move the order to the new column if the column has changed
  moveToColumn(id, column);

  // Close the edit overlay
  html.edit.overlay.classList.remove("open");
};
const handleDelete = (event) => {
  const orderId = html.edit.id.value;
  if (!orderId) return;

  // Remove the order from the state
  delete state.orders[orderId];

  // Remove the order from the DOM
  const orderHtml = document.querySelector(`[data-id="${orderId}"]`);
  if (orderHtml) {
    orderHtml.remove();
  }

  // Close the edit overlay
  html.edit.overlay.classList.remove("open");
};

html.add.cancel.addEventListener("click", handleAddToggle);
html.other.add.addEventListener("click", handleAddToggle);
html.add.form.addEventListener("submit", handleAddSubmit);

html.other.grid.addEventListener("click", handleEditToggle);
html.edit.cancel.addEventListener("click", handleEditToggle);
html.edit.form.addEventListener("submit", handleEditSubmit);
html.edit.delete.addEventListener("click", handleDelete);

html.help.cancel.addEventListener("click", handleHelpToggle);
html.other.help.addEventListener("click", handleHelpToggle);

for (const htmlColumn of Object.values(html.columns)) {
  htmlColumn.addEventListener("dragstart", handleDragStart);
  htmlColumn.addEventListener("dragend", handleDragEnd);
}

for (const htmlArea of Object.values(html.area)) {
  htmlArea.addEventListener("dragover", handleDragOver);
}
