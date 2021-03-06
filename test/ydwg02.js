const chai = require('chai')
chai.Should()
chai.use(require('chai-things'))
chai.use(require('chai-json-equal'));
chai.use(require('chai-string'));

const { FromPgn } = require('../index')

describe('Convert Yacht Devices RAW format data', function () {

  var tests = [
    {
      input: [ '16:29:27.082 R 09F8017F 50 C3 B8 13 47 D8 2B C6'],
      expected: {
        "src":127,
        "prio":2,
        "dst":255,
        "pgn":129025,
        "timestamp":"T21:29:27.082Z",
        "fields": {
          "Latitude":33.0875728,
          "Longitude":-97.0205113}
        ,
        "description":"Position, Rapid Update"
      }
    },
    {
      input: [ '16:29:27.986 R 0DF8057F 00 2B 00 18 46 80 D6 62',
               '16:29:27.987 R 0DF8057F 01 23 40 63 1B CC B8 81',
               '16:29:27.987 R 0DF8057F 02 97 04 80 C2 7F FC 96',
               '16:29:27.988 R 0DF8057F 03 23 89 F2 E0 A4 E0 08',
               '16:29:27.989 R 0DF8057F 04 00 00 00 00 12 FC 00',
               '16:29:27.989 R 0DF8057F 05 32 00 64 00 A0 F6 FF',
               '16:29:27.990 R 0DF8057F 06 FF 00 FF FF FF FF FF'
             ],
      expected: {
        "src":127,
        "prio":3,
        "dst":255,
        "pgn":129029,
        "timestamp":"T21:29:27.990Z",
        "fields": {
          "SID":0,
          "Date":"2019.02.17",
          "Time":"16:29:28",
          "Latitude":33.08757283333333,
          "Longitude":-97.02051133333333,
          "Altitude":148.94,
          "GNSS type":"GPS+GLONASS",
          "Method":"GNSS fix",
          "Integrity":"No integrity checking",
          "Number of SVs":0,
          "HDOP":0.5,
          "PDOP":1,
          "Geoidal Separation":-24,
          "Reference Stations":0,
          "list":[{"Reference Station ID":15}]
          },
        "description":"GNSS Position Data"
      }
    }
  ]

  tests.forEach(test => {
    it(`from ${test.expected.pgn} converts`, function (done) {

      var fromPgn = new FromPgn()

      fromPgn.on('error', (pgn, error) => {
        console.error(`Error parsing ${pgn.pgn} ${error}`)
        console.error(error.stack)
        done(error)
      })

      fromPgn.on('warning', (pgn, warning) => {
        done(new Error(`${pgn.pgn} ${warning}`))
      })

      fromPgn.on('pgn', (pgn) => {
        try {
          //console.log(JSON.stringify(pgn))

          let timestamp = pgn.timestamp
          delete pgn.timestamp
          timestamp.should.endWith(test.expected.timestamp)
          delete test.expected.timestamp
          
          pgn.should.jsonEqual(test.expected)
          done()
        } catch ( e ) {
          done(e)
        }
      })
      test.input.forEach(sentence => {
        fromPgn.parseYDWG02(sentence)
      })
    })
  })
})
