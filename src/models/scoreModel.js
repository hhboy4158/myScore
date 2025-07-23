const db = require('../utils/db');

const scoreModel = {
    /**
     * 
     * Inserts or updates multiple score records in a single query (bulk upsert).
     * This is more efficient than inserting/updating row by row in a loop.
     * Requires a UNIQUE key on (assignment_id, reviewer_id, evaluated_user_id, criterion_id).
     * @param {Array<Array<any>>} scoresData - An array of arrays, where each inner array contains the values for a row:
     *   [assignment_id, reviewer_id, evaluated_user_id, criterion_id, score]
     * @param {object} connection - A database connection object, used for transactions.
     * @returns {Promise<object>} - The result object from the database query.
     */
    upsert: async (scoresData, connection) => {
        const dbConnection = connection || db;
        const sql = `
            INSERT INTO Scores (assignment_id, reviewer_id, evaluated_user_id, criterion_id, score)
            VALUES ?
            ON DUPLICATE KEY UPDATE score = VALUES(score)
        `;
        const [result] = await dbConnection.query(sql, [scoresData]);
        return result;
    },

    /**
     * Finds all scores submitted by a specific reviewer for a specific assignment.
     * @param {number} assignmentId - The ID of the assignment.
     * @param {number} reviewerId - The ID of the reviewer.
     * @returns {Promise<Array<object>>} - A promise that resolves to an array of score records.
     */
    findByReviewerAndAssignment: async (assignmentId, reviewerId) => {
        const sql = 'SELECT evaluated_user_id, criterion_id, score FROM Scores WHERE assignment_id = ? AND reviewer_id = ?';
        const [rows] = await db.query(sql, [assignmentId, reviewerId]);
        return rows;
    }
}
module.exports = scoreModel;