const { teamService } = require("../services");
const { HTTP_STATUS_CODE } = require("../lib/constants");
const { TeamTransformer } = require("../http/transformers/team-transformer");

exports.getFilteredTeams = async (req, res, next) => {
  try {
    const response = await teamService.getFilteredTeams(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json(
        req.headers.is_filter === "true"
          ? TeamTransformer.transformFilter(response)
          : TeamTransformer.transformList(response),
      );
  } catch (error) {
    next(error);
  }
};

exports.getTeamById = async (req, res, next) => {
  try {
    const { team, lines } = await teamService.getTeamById(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.OK)
      .json(TeamTransformer.transformDetail(team, lines));
  } catch (error) {
    next(error);
  }
};

exports.createTeam = async (req, res, next) => {
  try {
    const team = await teamService.createTeam(req);
    res
      .status(HTTP_STATUS_CODE.ENUM.CREATED)
      .json({ message: "Team created successfully.", uuid: team.uuid });
  } catch (error) {
    next(error);
  }
};

exports.updateTeam = async (req, res, next) => {
  try {
    await teamService.updateTeam(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Team updated successfully." });
  } catch (error) {
    next(error);
  }
};

exports.deleteTeam = async (req, res, next) => {
  try {
    await teamService.deleteTeam(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Team deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.addTeamMembers = async (req, res, next) => {
  try {
    await teamService.addTeamMembers(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Members added successfully." });
  } catch (error) {
    next(error);
  }
};

exports.removeTeamMember = async (req, res, next) => {
  try {
    await teamService.removeTeamMember(req);
    res.status(HTTP_STATUS_CODE.ENUM.OK).json({ message: "Member removed successfully." });
  } catch (error) {
    next(error);
  }
};
