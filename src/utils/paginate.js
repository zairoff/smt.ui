export function paginate(items, pageNumber, pageSize) {
  const index = (pageNumber - 1) * pageSize;
  const newItems = items.slice(index);
  return extractArray(newItems, pageSize);
}

function extractArray(items, pageSize) {
  let res = [];
  for (let i = 0; i < items.length; i++) {
    if (i === pageSize) break;

    res.push(items[i]);
  }
  return res;
}
