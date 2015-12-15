/**
 * rectangle.js - A text rectangle constructor.
 *
 * TODO: decide on a method to index the columns and rows.
 *
 * Important notes - Columns and rows are input into the api starting at
 * [1,1] though the data array manages indexes starting at [0][0]
 */

var Rectangle = function (columns, rows, string) {
  var q
  var r
  var current
  var array = []

  if (string) {
    for (r = 0; r < rows; r++) {
      array[r] = []
      for (q = 0; q < columns; q++) {
        current = string[r * rows + q]
        array[r][q] = current || null
      }
    }
  } else {
    for (r = 0; r < rows; r++) {
      array[r] = []
      for (q = 0; q < columns; q++) {
        array[r][q] = null
      }
    }
  }

  Object.defineProperties(this, {
    'rows': {
      get: function () { return rows }
    },
    'columns': {
      get: function () { return columns }
    },
    '_array': {
      get: function () { return array }
    }
  })
}

Rectangle.prototype.setCell = function (q, r, item) {
  this._array[r][q] = item
}

Rectangle.prototype.clearCell = function (q, r) {
  this.setCell(q, r, null)
}

Rectangle.prototype.drawRect = function (q1, r1, rect) {
  var q2 = (q1 + rect.columns > this.columns) ? this.columns : q1 + rect.columns
  var r2 = (r1 + rect.rows > this.rows) ? this.rows : r1 + rect.rows
  var array = this._array

  rect.eachCell(function (item, q, r) {
    if (item) {
      var currentQ = q + q1
      var currentR = r + r1
      if (currentQ < q2 && currentR < r2) {
        array[currentR][currentQ] = item
      }
    }
  })
}

Rectangle.prototype.fillRect = function (q1, r1, width, height, value) {
  var row
  var column
  var r2 = (r1 + height > this.rows) ? this.rows : r1 + height
  var q2 = (q1 + width > this.columns) ? this.columns : q1 + width
  var array = this._array
  for (row = r1; row < r2; row++) {
    for (column = q1; column < q2; column++) {
      array[row][column] = value
    }
  }
}

Rectangle.prototype.clearRect = function (q, r, width, height) {
  if (!q && !r) {
    this.fillRect(0, 0, this.columns, this.rows, null)
  } else if (width && height) {
    this.fillRect(q, r, width, height, null)
  }
}

Rectangle.prototype.clearRow = function (row) {
  this.clearRect(0, row, this.columns, 1)
}

Rectangle.prototype.setRow = function (row, string, centered) {
  if (row < this.rows) {
    this.clearRow(row)
    var end
    var start = 0
    var center
    var columns = this.columns
    var length = (string.length < columns) ? string.length : columns
    var arrayRow = this._array[row]
    if (centered && length < columns) {
      center = Math.floor(columns / 2)
      start = center - Math.floor(length / 2)
    }
    end = start + length
    for (var i = start, j = 0; i < end; i++, j++) {
      // Need a seperate index `j` for `string` to start at 0.
      arrayRow[i] = string[j]
    }
  }
}

Rectangle.prototype.eachCell = function (iteratee) {
  var q
  var r
  var array = this._array
  var columns = this.columns
  var rows = this.rows
  for (r = 0; r < rows; r++) {
    for (q = 0; q < columns; q++) {
      iteratee(array[r][q], q, r)
    }
  }
}

Rectangle.prototype.stringify = function () {
  var string = ''
  var eol = this.columns - 1
  this.eachCell(function (item, q, r) {
    item ? string += item : string += ' '
    if (q === eol) { string += '\n' }
  })
  return string
}

Rectangle.prototype.log = function () {
  console.log(this.stringify())
}

module.exports = Rectangle
