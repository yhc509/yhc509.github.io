#!/bin/bash

# 블로그 배포 스크립트
# 사용법: ./deploy.sh

set -e  # 에러 발생시 중단

BLOG_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_REPO="../yhc509.github.io"

echo "🔧 블로그 빌드 중..."
cd "$BLOG_DIR"

# 이전 빌드 결과물 삭제
rm -rf .next out

# 환경 변수 설정
export NEXT_PUBLIC_BASE_URL="https://yhc509.github.io"

# 빌드 실행
npm run build

if [ ! -d "out" ]; then
    echo "❌ 빌드 실패: out 폴더가 생성되지 않았습니다."
    exit 1
fi

echo "✅ 빌드 완료!"

# 배포 레포 확인
if [ ! -d "$DEPLOY_REPO" ]; then
    echo "📥 배포 레포 클론 중..."
    git clone https://github.com/yhc509/yhc509.github.io.git "$DEPLOY_REPO"
fi

echo "📁 빌드 결과물 복사 중..."
cd "$DEPLOY_REPO"

# .git 폴더 제외하고 모든 파일 삭제
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

# 빌드 결과물 복사
cp -r "$BLOG_DIR/out/"* .

# GitHub Pages에서 Jekyll 빌드 비활성화
touch .nojekyll

echo "📤 GitHub에 배포 중..."
git add -A
git commit -m "Deploy blog - $(date '+%Y-%m-%d %H:%M:%S')"
git push

echo ""
echo "🎉 배포 완료!"
echo "🌐 https://yhc509.github.io 에서 확인하세요"
