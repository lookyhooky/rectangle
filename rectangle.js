/**
 * rectangle.js - A rectangle constructor... aka Two Dimensional Array
 *
 * TODO: decide on a method to index the columns and rows.
 *
 * Important notes - Columns and rows are input into the api starting at
 * [1,1] though the data array manages indexes starting at [0][0]
 */

function isArrayLike (obj) {
  return (Array.isArray(obj) || (!!obj && typeof item !== 'function' &&
                                 obj.hasOwnProperty('length') &&
                                 typeof obj.length === 'number'))
}

function isEmpty (item) {
  return (isArrayLike(item) && item.length === 0)
}

function hasRow (rect, row) {
  return (row > -1 && row < rect.dims.rows)
}

function hasColumn (rect, column) {
  return (column > -1 && column < rect.dims.columns)
}

function build2DArray (array, columns, rows, iteratee) {
  var row, column
  array.length = rows // Truncate incase rebuilding the array.
  iteratee = iteratee || function (row, column) { return null }
  for (row = 0; row < rows; row++) {
    array[row] = []
    for (column = 0; column < columns; column++) {
      array[row][column] = iteratee(column, row)
    }
  }
}

var each = function (rect, iteratee, context) {
  var q, r, array, qCount, rCount
  array = rect._array
  for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
    for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
      iteratee.call(context, array[r][q], q, r, array)
    }
  }
}

each.row = function (rect, iteratee, context) {
  var q, r, row, array, qCount, rCount
  array = rect._array
  for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
    row = []
    for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
      row.push(array[r][q])
    }
    iteratee.call(context, row, r, array)
  }
}

each.column = function (rect, iteratee, context) {
  var q, r, array, qCount, rCount, column
  array = rect._array
  for (q = 0, qCount = rect.dims.columns; q < qCount; q++) {
    column = []
    for (r = 0, rCount = rect.dims.rows; r < rCount; r++) {
      column.push(array[r][q])
    }
    iteratee.call(context, column, q, array)
  }
}

each.of = {
  row: function (rect, r, iteratee, context) {
    if (hasRow(rect, r)) {
      var q, array, count
      array = rect._array
      for (q = 0, count = rect.dims.columns; q < count; q++) {
        iteratee.call(context, array[r][q], q, r, array, q)
      }
    }
  },
  column: function (rect, q, iteratee, context) {
    if (hasColumn(rect, q)) {
      var r, array, count
      array = rect._array
      for (r = 0, count = rect.dims.rows; r < count; r++) {
        iteratee.call(context, array[r][q], q, r, array, r)
      }
    }
  }
}

function impose (main, rect, q1, r1) {
  var q2, r2, array

  array = main._array

  q2 = (q1 + rect.dims.columns > main.dims.columns)
    ? main.dims.columns
    : q1 + rect.dims.columns

  r2 = (r1 + rect.dims.rows > main.dims.rows)
    ? main.dims.rows
    : r1 + rect.dims.rows

  each(rect, function (item, q, r) {
    if (item) {
      var currentQ = q + q1
      var currentR = r + r1
      if (currentQ < q2 && currentR < r2) {
        array[currentR][currentQ] = item
      }
    }
  })
}

var Rectangle = function (columns, rows, items) {
  Object.defineProperties(this, {
    'dims': {
      value: { columns: columns, rows: rows }
    },
    '_array': {
      value: []
    }
  })

  if (isArrayLike(items)) {
    build2DArray(this._array, columns, rows, function (column, row) {
      return items[row * rows + column]
    })
  } else {
    build2DArray(this._array, columns, rows)
  }
}

Rectangle.prototype.rebuild = function (columns, rows, iteratee) {
  var old = this._array.splice(0, this._array.length)
  build2DArray(this._array, columns, rows, function (column, row) {
    return old[row][column] || null
  })
}

Rectangle.prototype.setCell = function (q, r, item) {
  if (hasColumn(this, q) && hasRow(this, r)) {
    this._array[r][q] = item
  }
  return item
}

Rectangle.prototype.getCell = function (q, r) {
  return (hasColumn(this, q) && hasRow(this, r)) ? this._array[r][q] : null
}

Rectangle.prototype.clearCell = function (q, r) {
  return this.setCell(q, r, null)
}

Rectangle.prototype.each = function (iteratee, context) {
  each(this, iteratee, context)
  return this
}

function prepare (fill) {
  if (typeof fill === 'function') {
    return fill
  } else if (isArrayLike(fill)) {
    var length = fill.length              // Might want to look into generators.
    return function (item, q, r, array, index) { // Need the additional index for accessing
      array[r][q] = (index < length) ? fill[index] : null // the arrayLike seperately.
    }
  } else {
    return function (item, q, r, array) {
      array[r][q] = null
    }
  }
}

Rectangle.prototype.setRow = function (r, fill) {
  each.of.row(this, r, prepare(fill))
  return this
}

Rectangle.prototype.setColumn = function (q, fill) {
  each.of.column(this, q, prepare(fill))
  return this
}

Rectangle.prototype.getRow = function (r) {
  var row = []
  each.of.row(this, r, function (item) {
    row.push(item)
  })
  return (!isEmpty(row) ? row : null)
}

Rectangle.prototype.getColumn = function (q) {
  var column = []
  each.of.column(this, q, function (item) {
    column.push(item)
  })
  return (!isEmpty(column) ? column : null)
}

Rectangle.prototype.addRow = function (fill) {
  var r = this.dims.rows++
  this._array[r] = []
  this.setRow(r, fill)
  return this
}

Rectangle.prototype.addColumn = function (fill) {
  var q = this.dims.columns++
  this.setColumn(q, fill)
  return this
}

Rectangle.prototype.fillRect = function (q1, r1, width, height, value) {
  var q2, r2, row, rows, array, column, columns

  array = this._array
  rows = this.dims.rows
  columns = this.dims.columns

  r2 = ((r1 + height) < rows) ? r1 + height : rows
  q2 = ((q1 + width) < columns) ? q1 + width : columns

  for (row = r1; row < r2; row++) {
    for (column = q1; column < q2; column++) {
      array[row][column] = value
    }
  }
}

Rectangle.prototype.clearRect = function (q, r, width, height) {
  if (!q && !r) {
    this.fillRect(0, 0, this.dims.columns, this.dims.rows, null)
  } else if (width && height) {
    this.fillRect(q, r, width, height, null)
  }
}

Rectangle.prototype.clearRow = function (row) {
  this.clearRect(0, row, this.dims.columns, 1)
}

Rectangle.prototype.imposeRect = function (rect, q1, r1) {
  impose(this, rect, q1, r1)
}

// Rectangle.prototype.setRow = function (row, string, centered) {
//   if (row < this.rows) {
//     this.clearRow(row)
//     var end
//     var start = 0
//     var center
//     var columns = this.columns
//     var length = (string.length < columns) ? string.length : columns
//     var arrayRow = this._array[row]
//     if (centered && length < columns) {
//       center = Math.floor(columns / 2)
//       start = center - Math.floor(length / 2)
//     }
//     end = start + length
//     for (var i = start, j = 0; i < end; i++, j++) {
//       // Need a seperate index `j` for `string` to start at 0.
//       arrayRow[i] = string[j]
//     }
//   }
// }

// Rectangle.prototype.stringify = function () {
//   var string = ''
//   var eol = this.columns - 1
//   each(this, function (item, q, r, array) {
//     string += isEmpty(item) ? ' ' : item
//     if (q === eol) { string += '\n' }
//   })
//   return string
// }

// Rectangle.prototype.log = function () {
//   console.log(this.stringify())
// }

module.exports = Rectangle
