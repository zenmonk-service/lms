const userSummary = (user) =>
  user
    ? {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        emp_code: user.emp_code,
        image: user.image,
        is_active: user.is_active,
      }
    : null;

const byName = (a, b) => String(a.name).localeCompare(String(b.name));

class TeamTransformer {
  static transformTeam(team) {
    return {
      uuid: team.uuid,
      name: team.name,
      description: team.description,
      lead: userSummary(team.lead),
      member_count: Number(team.get("member_count") ?? 0),
      created_at: team.created_at,
      updated_at: team.updated_at,
    };
  }

  static transformList(response) {
    return {
      ...response,
      rows: response.rows.map((team) => ({
        ...TeamTransformer.transformTeam(team),
        members: team.get("member_preview") ?? [],
      })),
    };
  }

  static transformFilter(teams) {
    return teams.map((team) => ({
      uuid: team.uuid,
      name: team.name,
      lead: team.lead
        ? { user_id: team.lead.user_id, name: team.lead.name }
        : null,
    }));
  }

  /** `lines` are this team's reporting lines (from userTeamRepository.findLines). */
  static transformDetail(team, lines = []) {
    const managersOf = new Map();
    for (const line of lines) {
      const list = managersOf.get(line.user_id) ?? [];
      list.push({ user_id: line.manager_uuid, name: line.manager_name });
      managersOf.set(line.user_id, list);
    }
    const members = (team.members || [])
      .map((member) => ({
        ...userSummary(member),
        is_lead: member.id === team.lead_id,
        role: member.role
          ? { uuid: member.role.uuid, name: member.role.name }
          : null,
        managers: managersOf.get(member.id) ?? [],
      }))
      .sort((a, b) => Number(b.is_lead) - Number(a.is_lead) || byName(a, b));

    return { ...TeamTransformer.transformTeam(team), members };
  }
}

const teamRef = (line) =>
  line.team_uuid ? { uuid: line.team_uuid, name: line.team_name } : null;

class HierarchyTransformer {
  static transformNode(user, directReportCount = 0) {
    return {
      ...userSummary(user),
      role: user.role ? { uuid: user.role.uuid, name: user.role.name } : null,
      teams: (user.teams || [])
        .map((team) => ({ uuid: team.uuid, name: team.name }))
        .sort(byName),
      direct_report_count: directReportCount,
    };
  }

  /** A reporting line on the canvas: `user_id` reports to `manager_id` (within `team`). */
  static transformLine(line) {
    return {
      user_id: line.user_uuid,
      manager_id: line.manager_uuid,
      team: teamRef(line),
    };
  }

  /** A user's manager as shown on their profile. */
  static transformManager(line) {
    return {
      user_id: line.manager_uuid,
      name: line.manager_name,
      email: line.manager_email,
      image: line.manager_image,
      team: teamRef(line),
    };
  }
}

module.exports = { TeamTransformer, HierarchyTransformer, byName };
