/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;

var db = null;
MongoClient.connect(CONNECTION_STRING, function (err, con) {
  db = con;
});

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      var project = req.params.project;

      var filter = { project };
      //filter = {};
      db.collection('issue').find(filter).toArray(
        function (err, results) {
          if (err) return res.status(400).json({ err });

          return res.json(results);
        });
    })

    .post(function (req, res) {
      var project = req.params.project;
      var {
        issue_title,
        issue_text,
        created_by,
        assigned_to = '',
        status_text = '',
        open = true
      } = req.body;

      var objectToInsert = {
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open: Boolean(open),
        created_on: new Date(),
        updated_on: null
      };

      var requiredFields = [
        'project',
        'issue_title',
        'issue_text',
        'created_by'
      ];

      const missingFields = requiredFields
        .filter(field => objectToInsert[field] === undefined)
        .map(field => `Missing field: ${field}`);

      if (missingFields.length > 0) {
        return res.status(400).json(missingFields);
      }

      db.collection('issue').insert(
        objectToInsert,
        function (err) {
          if (err) return res.status(400).send('');

          return res.json(objectToInsert);
        });
    })

    .put(function (req, res) {
      var project = req.params.project;
      var {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      const propsReceived = {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
        updated_on: new Date(),
      };

      Object.keys(propsReceived).forEach(prop => {
        if (propsReceived[prop] === undefined) {
          delete propsReceived[prop];
        }
      });

      db.collection('issue').find({ _id: ObjectId(_id) }).toArray(
        function (err, results) {
          if (err) return res.status(400).json({});

          var [objectFound] = results;

          if (!objectFound) return res.status(400).json({});

          var objectToUpdate = Object.assign(objectFound, propsReceived);

          db.collection('issue').updateOne(
            { _id: ObjectId(_id) },
            objectToUpdate,
            function (err) {
              if (err) return res.status(400).json({});

              return res.json(objectToUpdate);
            });
        });
    })

    .delete(async function (req, res) {
      var project = req.params.project;
      var {
        _id
      } = req.query;

      if (_id === undefined) return res.status(400).json({});

      var filter = { _id: ObjectId(_id) };

      db.collection('issue').find(filter).toArray(
        function (err, results) {
          if (err) return res.status(400).json({});

          var [objectFound] = results;
          if (!objectFound) return res.status(400).json({});

          db.collection('issue').deleteOne(
            filter,
            function (err) {
              if (err) return res.status(400).json({});

              return res.status(200).json({});
            });
        });
    });

};
