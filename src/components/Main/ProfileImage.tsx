import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { GatsbyImage, IGatsbyImageData } from 'gatsby-plugin-image'

// 자신이 원하는 프로필 이미지 링크로 설정해주세요.
const PROFILE_IMAGE_LINK =
  'https://avatars.githubusercontent.com/u/18284886?v=4'

const ProfileImageWrapper = styled.img`
  display: flex;
  width: 128px;
  height: 128px;
  margin-top: 8px;
  margin-bottom: 8px;
  border-radius: 50%;
  background-color:#464646;
  flex-direction: row nowrap;
  justify-content: default;
  align-item: center;

  @media (max-width: 768px) {
    width: 64px;
    height: 64px;
  }
`

type ProfileImageProps = {
  profileImage: IGatsbyImageData
}

const ProfileImage: FunctionComponent<ProfileImageProps> = function ({
  profileImage,
}) {
  return <ProfileImageWrapper image={profileImage} alt="Profile Image" />
}

export default ProfileImage