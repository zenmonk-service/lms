const router = require("express").Router();
const { teamControllers } = require("../controllers");
const { acl } = require("../middleware/acl-middleware");
const { Action, Permission } = require("@repo/common");

router
  .route("/")
  .get(
    acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.READ),
    teamControllers.getFilteredTeams,
  )
  .post(
    acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.CREATE),
    teamControllers.createTeam,
  );

router
  .route("/:team_uuid")
  .get(
    acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.READ),
    teamControllers.getTeamById,
  )
  .put(
    acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.UPDATE),
    teamControllers.updateTeam,
  )
  .delete(
    acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.DELETE),
    teamControllers.deleteTeam,
  );

router.post(
  "/:team_uuid/members",
  acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.UPDATE),
  teamControllers.addTeamMembers,
);

router.delete(
  "/:team_uuid/members/:user_uuid",
  acl(Permission.ENUM.TEAM_MANAGEMENT, Action.ENUM.UPDATE),
  teamControllers.removeTeamMember,
);

module.exports = router;
