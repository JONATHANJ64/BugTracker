'use strict';
const mongoose = require("mongoose");
const { Project } = require("../models");
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let projectName = req.params.project;

      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.query;

      const pipeline = [
        { $match: { name: projectName } },
        { $unwind: "$issues" },
      ];

      if (issue_title) {
        pipeline.push({ $match: { "issues.issue_title": issue_title } });
      }

      if (issue_text) {
        pipeline.push({ $match: { "issues.issue_text": issue_text } });
      }

      if (created_by) {
        pipeline.push({ $match: { "issues.created_by": created_by } });
      }

      if (assigned_to) {
        pipeline.push({ $match: { "issues.assigned_to": assigned_to } });
      }

      if (status_text) {
        pipeline.push({ $match: { "issues.status_text": status_text } });
      }
      if (_id) {
        pipeline.push({ $match: { "issues._id": mongoose.Types.ObjectId(_id) } });
      }

      if (open) {
        pipeline.push({ $match: { "issues.open": open } });
      }

      ProjectModel.aggregate(pipeline)
        .then((data) => {
          let mappedData = data.map((item) => ({
            _id: item.issues._id,
            issue_title: item.issues.issue_title,
            issue_text: item.issues.issue_text,
            created_by: item.issues.created_by,
            assigned_to: item.issues.assigned_to,
            status_text: item.issues.status_text,
            created_on: item.issues.created_on,
            updated_on: item.issues.updated_on,
            open: item.issues.open,
          }));
          res.json(mappedData);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({ error: "There was an error saving in post" });
        });
    })


    .post(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "require field(s) missing" });
        return;
      }
      const newIssue = new IssueModel({
        issue_title: issue_title || "",
        issue_text: issue_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || "",
        assigned_to: assigned_to || "",
        open: true,
        status_text: status_text || "",
      });
      ProjectModel.findOne({ name: project })
        .then(projectdata => {
          if (!projectdata) {
            const newProject = new ProjectModel({ name: project });
            newProject.issues.push(newIssue);
            return newProject.save();
          } else {
            projectdata.issues.push(newIssue);
            return projectdata.save();
          }
        })
        .then(savedData => {
          res.json(newIssue);
        })
        .catch(err => {
          res.end("There was an error saving in post");
        });
    })

    .put(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;
      if (!_id) {
        res.json({ error: "missing_id" });
        return;
      }
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }
      ProjectModel.findOne({ name: project })
        .then(projectdata => {
          if (!projectdata) {
            res.json({ error: "could not update", _id: _id });
          } else {
            const issueData = projectdata.issues.id(_id);
            if (!issueData) {
              res.json({ error: "could not update", _id: _id });
              return;
            }
            issueData.issue_title = issue_title || issueData.issue_title;
            issueData.issue_text = issue_text || issueData.issue_text;
            issueData.created_by = created_by || issueData.created_by;
            issueData.assigned_to = assigned_to || issueData.assigned_to;
            issueData.status_text = status_text || issueData.status_text;
            issueData.updated_on = new Date();
            issueData.open = open;
            projectdata.save()
              .then(data => {
                res.json({ result: "successfully updated", _id: _id });
              })
              .catch(err => {
                res.json({ result: "could not update", _id: _id });
              });
          }
        })
    })
    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      console.log("Project name:", project);
      console.log("Issue ID:", _id);
      
      if (!_id) {
        res.json({ error: "missing_id" });
        return;
      }

      ProjectModel.findOne({ name: project })
        .then(projectdata => {
          if (!projectdata) {
            console.log("Project not found");
            res.json({ error: "could not delete", _id: _id });
          } else {
            const issueData = projectdata.issues.id(_id);
            if (!issueData) {
              console.log("Issue not found");
              res.json({ error: "could not delete", _id: _id });
              return;
            }
            issueData.deleteOne();

            projectdata.save()
              .then(data => {
                console.log("Issue deleted successfully");
                res.json({ result: "successfully deleted", _id: _id });
              })
              .catch(err => {
                console.log("Error saving project data after issue deletion:", err);
                res.json({ error: "could not delete", _id: _id });
              });
          }
        })
        .catch(err => {
          console.log("Error finding project:", err);
          res.json({ error: "could not delete", _id: _id });
        });
    })
  }