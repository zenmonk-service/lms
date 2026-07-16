import ListLeaveTypes from "@/components/leave/list-leave-types";
import MainContainer from "@/shared/main-container";
import Title from "@/shared/typography/title";

export default function LeaveTypes() {
  return (
    <MainContainer>
      <Title
        title={{ text: "Leave Types" }}
        description={{ text: "Manage your leave types and their configurations." }}
      />
      <ListLeaveTypes />
    </MainContainer>
  );
}
