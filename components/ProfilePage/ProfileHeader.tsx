import { useTranslation } from "next-i18next"
import { useState } from "react"
import { useMediaQuery } from "usehooks-ts"
import { useAuth } from "../auth"
import { Row, Spinner } from "../bootstrap"
import { Profile, ProfileHook, useProfile } from "../db"
import { EditProfileButton, ProfileButtons } from "./ProfileButtons"
import { Header, ProfileDisplayName } from "./StyledProfileComponents"
import { ProfileIcon } from "./StyledUserIcons"
import ProfileSettingsModal from "components/EditProfilePage/ProfileSettingsModal"
import { FollowUserButton } from "components/shared/FollowButton"

export function HeaderWrapper({
  profileId,
  isUser,
  isOrg,
  onProfilePublicityChanged,
  profile
}: {
  isUser: boolean
  isOrg: boolean
  profile: Profile
  profileId: string
  onProfilePublicityChanged: (isPublic: boolean) => void
}) {
  const { user } = useAuth()
  const uid = user?.uid
  const result = useProfile()

  if (result.loading) {
    return (
      <Row>
        <Spinner animation="border" className="mx-auto" />
      </Row>
    )
  }

  if (result?.profile && uid) {
    return (
      <ProfileHeader
        actions={result}
        isUser={isUser}
        onProfilePublicityChanged={onProfilePublicityChanged}
        profile={profile}
        profileId={profileId}
      />
    )
  }

  // Todo add error handling/404 page?
}

export const ProfileHeader = ({
  actions,
  isUser,
  onProfilePublicityChanged,
  profile,
  profileId
}: {
  actions: ProfileHook
  isUser: boolean
  onProfilePublicityChanged: (isPublic: boolean) => void
  profile: Profile
  profileId: string
}) => {
  const { t } = useTranslation("profile")
  const { role } = profile // When we have more types of profile than org and user, we will need to use the actual role from the profile, and move away from isOrg boolean.
  const { user } = useAuth()
  const isLg = useMediaQuery("(max-width: 992px)")

  const {
    public: isPublic,
    notificationFrequency: notificationFrequency
  }: Profile = profile

  const [settingsModal, setSettingsModal] = useState<"show" | null>(null)
  const [notifications, setNotifications] = useState<
    "Weekly" | "Monthly" | "None"
  >(notificationFrequency ? notificationFrequency : "Monthly")
  const [isProfilePublic, setIsProfilePublic] = useState<false | true>(
    isPublic ? isPublic : false
  )

  const onSettingsModalOpen = () => {
    setSettingsModal("show")
    setNotifications(notificationFrequency ? notificationFrequency : "Monthly")
    setIsProfilePublic(isPublic ? isPublic : false)
  }

  return (
    <Header>
      <div
        className={`d-flex flex-row justify-content-start align-items-center gap-3 mx-5`}
      >
        <ProfileIcon role={role} large />
        <div>
          <ProfileDisplayName className={`col-3 col-md-auto`}>
            {profile.fullName}
          </ProfileDisplayName>
          {user && !isUser ? (
            <FollowUserButton profileId={profileId} />
          ) : (
            <EditProfileButton className={`py-1`} tab="button.editProfile" />
          )}
        </div>
      </div>
      <div
        className={`col-12 d-flex justify-content-center justify-content-md-end align-items-center ms-md-auto ${
          isLg ? `col-md-3` : `col-md-2`
        }`}
      >
        <ProfileButtons
          isProfilePublic={isProfilePublic}
          isUser={isUser}
          onProfilePublicityChanged={onProfilePublicityChanged}
          onSettingsModalOpen={onSettingsModalOpen}
          profileId={profileId}
        />
      </div>
      <ProfileSettingsModal
        actions={actions}
        role={profile.role}
        isProfilePublic={isProfilePublic}
        setIsProfilePublic={setIsProfilePublic}
        notifications={notifications}
        setNotifications={setNotifications}
        onHide={close}
        onSettingsModalClose={() => {
          setSettingsModal(null)
          window.location.reload()
          /* when saved and reopened, modal wasn't updating *
           * would like to find cleaner solution            */
        }}
        show={settingsModal === "show"}
      />
    </Header>
  )
}
