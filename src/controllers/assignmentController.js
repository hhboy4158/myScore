let assignments = [
  { id: 1, title: 'Assignment 1' },
  { id: 2, title: 'Assignment 2' }
];

exports.list = (req, res) => {
  res.json(assignments);
};