# AI-MovieReview

## 👨‍🏫 프로젝트 소개

키워드 여러개를 클릭해서 AI에게 맡기면 자동으로 세가지 타입의 문장을 생성

## ⏲️ 개발 기간

- 2025.03.20(목) ~ 2025.12.06(토)
- 탄소중립의 이해, DevOps 특강
- 아이디어 노트 작성
- 코딩테스트
- 아이디어 발표
- 해커톤
- 발표평가

## 🧑‍🤝‍🧑 개발자 소개

- **김원묵** : 팀장, 코드 편집
- **서한별** : 기획자, 개발자

![개발자 소개](https://github.com/gmlstjq123/INHA_NET_ZERO_HACKATHON/blob/hello_there-12/%EA%B0%9C%EB%B0%9C%EC%9E%90%20%EC%86%8C%EA%B0%9C.png)

## 💻 개발환경

- **Version** : Java 17
- **IDE** : IntelliJ
- **Framework** : SpringBoot 2.7.11
- **ORM** : JPA

## ⚙️ 기술 스택

- **Server** : AWS EC2
- **DataBase** : MySQL
- **WS/WAS** : Nginx, Tomcat
- **OCR** : AWS Textract, AWS S3
- **아이디어 회의** : 대면

## 📝 프로젝트 아키텍쳐

![프로젝트 아키텍쳐](https://github.com/gmlstjq123/INHA_NET_ZERO_HACKATHON/blob/hello_there-12/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%EC%95%84%ED%82%A4%ED%85%8D%EC%B3%90.png)

## 📌 주요 기능

- AI 자동리뷰 생성기
  - 공공데이터포털에서 제공하는 가전기기의 업체명, 모델명, 소비전력량, 에너지 효율등급, 시간당 이산화탄소 배출량를 csv 파일로 가져온다.
  - 가격필드를 추가한 후 데이터 크롤링을 이용해 가격 정보를 csv파일에 입력한다.
  - csv파일을 Json으로 변환하여 DB에 입력한다.
  - 전기냉장고, 전기냉방기, 김치냉장고, 전기세탁기 품목에 한정하여 진행하였다.
- 커뮤니티 기능
  - 텍스트로 모델명을 검색하면 텍스트와 일치하는 모델에 대한 정보가 사용자에게 반환된다. Like 연산자를 활용하여 모델명이 부분일치하는 경우도 반환할 수 있게 하였다.
  - 에너지소비효율 등급을 사진으로 찍으면 좌표값을 이용하여 모델명을 추출하여 해당 모델에 대한 정보를 사용자에게 반환한다.
- 품목 별 랭킹 조회
  - 기존의 에너지효율 등급과 탄소배출량 등을 고려하여 매긴 자체점수를 이용해 가전제품의 랭킹을 사용자에게 보여준다.
  - 기존의 에너지효율 등급만으로는 동일한 등급 간의 비교가 어려웠고, 얼마만큼의 이득이 생기는지가 수치적으로 드러나지 않는다는 단점이 존재했다. 이러한 점을 개선하기 위해 자체 점수 제도를 도입하였다.
  - 또한 등급간의 비율도 가전기기의 종류마다 제각각이었기 때문에 인공지능을 활용해 공평하게 등급을 구분하였다면

## ✒️ API

- API 상세설명 : <https://velog.io/@gmlstjq123/INHA-SW-NET-Zero-%EA%B3%B5%EB%8F%99%ED%95%B4%EC%BB%A4%ED%86%A4-Server-%EC%BD%94%EB%93%9C#3-%ED%92%88%EB%AA%A9%EB%B3%84-%EB%9E%AD%ED%82%B9-%EC%A1%B0%ED%9A%8C>

- API 명세서 : <https://makeus-challenge.notion.site/API-ecafb2a8fb8c427c9e78abf6120d674b>
