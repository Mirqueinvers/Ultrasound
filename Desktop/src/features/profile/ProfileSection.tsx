import React from "react";

import ProfilePage from "@/components/profile/ProfilePage";

import SectionLayout, {
  type SectionLayoutNavProps,
} from "@layout/SectionLayout";

type ProfileSectionProps = SectionLayoutNavProps;

const ProfileSection: React.FC<ProfileSectionProps> = (props) => {
  return (
    <SectionLayout {...props}>
      <ProfilePage />
    </SectionLayout>
  );
};

export default ProfileSection;