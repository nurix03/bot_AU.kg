module.exports = (sequelize, DataTypes) => {
  return sequelize.define("user", {
    name: DataTypes.STRING,
    namba_id: DataTypes.STRING,
    chat_id: DataTypes.STRING,
    subscription: DataTypes.BOOLEAN,
    rubric: DataTypes.INTEGER,
    sub_rubric: DataTypes.STRING,
    rubric_choosen: DataTypes.BOOLEAN,
    sub_rubric_choosen: DataTypes.BOOLEAN,
    rubrics_sent: DataTypes.BOOLEAN,
    sub_rubrics_sent: DataTypes.BOOLEAN,
    sub_rubrics_length: DataTypes.INTEGER,
    sub_rubrics_page: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
  });
}
