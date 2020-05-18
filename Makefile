install:
	cd ./api && npm i
	cd ./worker && pip install -r requirements.txt

test:
	cd ./api && npm test
	cd ./worker && python test_s3.py

dev:
	cd ./api && npm run dev

