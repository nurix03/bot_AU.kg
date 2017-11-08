module.exports = (sequelize, DataTypes) => {
  return sequelize.define("rubric", {
    name: DataTypes.STRING,
    rubric_id: DataTypes.INTEGER
  });
}
