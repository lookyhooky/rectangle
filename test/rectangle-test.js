/**
 * rectangle-test.js
 */
var beforeEach = require('mocha').beforeEach
var describe = require('mocha').describe
var it = require('mocha').it

var expect = require('chai').expect

var Rectangle = require('../rectangle.js')

describe('rectangle', function () {
  var rows, rect, other, filler

  beforeEach(function () {
    filler = 'abcdefghi'
    rect = new Rectangle(3, 3, filler)
    other = new Rectangle(2, 2)
    rows = rect.rows
  })

  describe('constructor', function () {
    it('should create a rectangle with proper dimensions', function () {
      var expected = 3
      expect(rect.array.length).to.equal(expected) // rows
      for (var r = 0, len = rect.array.length; r < len; r++) {
        expect(rect.array[r].length).to.equal(expected) // columns of each row
      }
    })
    it('should initialize with no fill argument', function () {
      var expected = [null, null, null, null, null, null, null, null, null]
      rect = new Rectangle(3, 3)
      var count = rect.rows
      for (var r = 0, len = rect.array.length; r < len; r++) {
        for (var q = 0, inner = rect.array[r].length; q < inner; q++) {
          expect(rect.array[r][q]).to.equal(expected[r * count + q])
        }
      }
    })
    it('should initialize with string for fill', function () {
      var expected = ['abc', 'def', 'ghi']
      rect = new Rectangle(3, 3, 'abcdefghi')
      for (var r = 0, len = rect.array.length; r < len; r++) {
        for (var q = 0, inner = rect.array[r].length; q < inner; q++) {
          expect(rect.array[r][q]).to.equal(expected[r][q])
        }
      }
    })
    it('should initialize with an array for fill', function () {
      var expected = ['abc', 'def', 'ghi']
      rect = new Rectangle(3, 3, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'])
      for (var r = 0, len = rect.array.length; r < len; r++) {
        for (var q = 0, inner = rect.array[r].length; q < inner; q++) {
          expect(rect.array[r][q]).to.equal(expected[r][q])
        }
      }
    })
  })

  describe('dimensions', function () {
    it('should have a property \'rows\'', function () {
      expect(rect).to.have.property('rows')
    })
    it('\'rows\' should represent the length of the first dimension', function () {
      expect(rect.rows).to.equal(rect.array.length)
    })
    it('should have a property \'columns\'', function () {
      expect(rect).to.have.property('columns')
    })
    it('\'columns\' should represent the length of the second dimension', function () {
      for (var r = 0, len = rect.rows; r < len; r++) {
        expect(rect.columns).to.equal(rect.array[r].length)
      }
    })
  })

  describe('#each', function () {
    it('should iterate and pass each item to iteratee as first argument', function () {
      var expected = 'abcdefghi'
      rect.each(function (item, q, r, array) {
        expect(item).to.equal(expected[r * rows + q])
      })
    })
    it('should iterate and pass current column to iteratee as second argument', function () {
      var expected = [0, 1, 2, 0, 1, 2, 0, 1, 2]
      rect.each(function (item, q, r, array) {
        expect(q).to.equal(expected[r * rows + q])
      })
    })
    it('should iterate and pass current row to iteratee as third argument', function () {
      var expected = [0, 0, 0, 1, 1, 1, 2, 2, 2]
      rect.each(function (item, q, r, array) {
        expect(r).to.equal(expected[r * rows + q])
      })
    })
    it('should iterate and pass array to iteratee as forth argument', function () {
      var expected = rect.array
      rect.each(function (item, q, r, array) {
        expect(array).to.equal(expected)
      })
    })
  })

  describe('Get Methods', function () {
    describe('#get', function () {
      it('should return the value of a specific cell', function () {
        var foo = rect.get(0, 2)
        var bar = other.get(0, 1)
        var baz = rect.get(2, 0)
        expect(foo).to.equal(filler[6])
        expect(bar).to.be.null
        expect(baz).to.equal(filler[2])
      })
    })

    describe('#getRow', function () {
      it('should return a new array representing a row', function () {
        var row = rect.getRow(2)
        row.forEach(function (item, index, array) {
          expect(item).to.equal(filler[rows * 2 + index])
        })
      })
      it('should return \'null\' if row is not in the rectangle', function () {
        var row = rect.getRow(3)
        expect(row).to.be.null
      })
    })

    describe('#getColumn', function () {
      it('should return a new array representing a column', function () {
        var count = 2
        var column = rect.getColumn(count)
        column.forEach(function (item, index, array) {
          expect(item).to.equal(filler[rows * index + count])
        })
      })
      it('should return \'null\' if column is not in the rectangle', function () {
        var column = rect.getColumn(3)
        expect(column).to.be.null
      })
    })
  })

  describe('Set Methods', function () {
    var tests, expected, selection

    expected = ['1', '2', '3']
    selection = 1

    tests = [
      {
        arg: ['1', '2', '3'],
        type: 'Array'
      },
      {
        arg: '123',
        type: 'String'
      },
      {
        arg: function (item, q, r, array, index) { array[r][q] = expected[index] },
        type: 'Function'
      }
    ]

    describe('#set', function () {
      var expected = 'j'
      it('should modify a selected cell of the rectangle', function () {
        rect.set(0, 0, expected)
        expect(rect.array[0][0]).to.equal(expected)
      })
      it('should not modify any other cell of the rectangle', function () {
        rect.set(0, 0, expected)
        rect.each(function (item, q, r, array) {
          if (q !== 0 && r !== 0) {
            expect(item).to.equal(filler[rows * r + q])
          }
        })
      })
    })

    describe('#setRow', function () {
      tests.forEach(function (test) {
        it('properly accepts ' + test.type + ' as a second argument', function () {
          rect
            .setRow(selection, test.arg)
            .getRow(selection)
            .forEach(function (item, index, array) {
              expect(item).to.equal(expected[index])
            })
        })
      })
    })

    describe('#setColumn', function () {
      tests.forEach(function (test) {
        it('properly accepts ' + test.type + ' as a second argument', function () {
          rect
            .setColumn(selection, test.arg)
            .getColumn(selection)
            .forEach(function (item, index, array) {
              expect(item).to.equal(expected[index])
            })
        })
      })
    })
  })

  describe('Add Methods', function () {
    var tests, expected, selection

    expected = ['1', '2', '3']
    selection = 3

    tests = [
      {
        arg: ['1', '2', '3'],
        type: 'Array'
      },
      {
        arg: '123',
        type: 'String'
      },
      {
        arg: function (item, q, r, array, index) { array[r][q] = expected[index] },
        type: 'Function'
      }
    ]

    describe('#addRow', function () {
      tests.forEach(function (test) {
        it('properly accepts ' + test.type + ' as a second argument', function () {
          rect
            .addRow(test.arg)
            .getRow(selection)
            .forEach(function (item, index, array) {
              expect(item).to.equal(expected[index])
            })
        })
      })
      it('increments the dimensions property \'rows\'', function () {
        rect.addRow()
        expect(rect.rows).to.equal(4)
      })
    })

    describe('#addColumn', function () {
      tests.forEach(function (test) {
        it('properly accepts ' + test.type + ' as an argument', function () {
          rect
            .addColumn(test.arg)
            .getColumn(selection)
            .forEach(function (item, index, array) {
              expect(item).to.equal(expected[index])
            })
        })
      })
      it('increments the dimensions property \'columns\'', function () {
        rect.addColumn()
        expect(rect.columns).to.equal(4)
      })
    })
  })

  describe('Clear Methods', function () {
    var selection

    selection = 1

    describe('#clear', function () {
      it('properly sets a single cell to \'null\'', function () {
        rect.clear(selection, selection)
        var value = rect.get(selection, selection)
        expect(value).to.be.null
      })
    })

    describe('#clearRow', function () {
      it('properly sets all cells of the row to \'null\'', function () {
        rect
          .clearRow(selection)
          .getRow(selection)
          .forEach(function (item, index, array) {
            expect(item).to.be.null
          })
      })
    })

    describe('#clearColumn', function () {
      it('properly sets all cells of the column to \'null\'', function () {
        rect
          .clearColumn(selection)
          .getColumn(selection)
          .forEach(function (item, index, array) {
            expect(item).to.be.null
          })
      })
    })
  })

  describe('#rebuild', function () {
    var test = function (columns, rows) {
      rect.rebuild(columns, rows)
      expect(rect.rows).to.equal(rows)
      expect(rect.columns).to.equal(columns)
    }

    it('can add rows', function () {
      test(3, 4)
    })
    it('can add columns', function () {
      test(4, 3)
    })
    it('can add rows and columns', function () {
      test(6, 6)
    })
    it('can remove rows', function () {
      test(3, 2)
    })
    it('can remove columns', function () {
      test(2, 3)
    })
    it('can remove rows and columns', function () {
      test(2, 2)
    })
  })
})
