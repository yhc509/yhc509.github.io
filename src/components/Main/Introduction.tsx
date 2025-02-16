import React, { FunctionComponent } from 'react'
import styled from '@emotion/styled'
import { IGatsbyImageData } from 'gatsby-plugin-image'
import ProfileImage from 'components/Main/ProfileImage'

const Background = styled.div`
  width: 100%;
  background-image: linear-gradient(60deg, #29323c 0%, #485563 100%);
  color: #ffffff;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 768px;
  height: 80px;
  margin: 0 auto;
  padding-bottom: 12px
  
  @media (max-width: 768px) {
    width: 100%;
    height: 80px;
    padding: 0 12px;
  }
`

const SubTitle = styled.div`
  font-size: 16px;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`

const Title = styled.div`
  margin-top: 5px;
  font-size: 24px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`

type IntroductionProps = {
  profileImage: IGatsbyImageData
}

const Introduction: FunctionComponent<IntroductionProps> = function ({
  profileImage,
}) {
  return (
    <Background>
      <Wrapper>
        <Title>yhc509`s blog</Title>
      </Wrapper>
    </Background>
  )
}

export default Introduction