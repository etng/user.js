submit:
	git add .
	git commit -am "updated"
	git push
new:
	open https://greasyfork.org/zh-CN/import
	make show_urls
	echo https://github.com/etng/user.js/raw/main/avgBandWidthDisplay.user.js
.PHONY: show_urls
show_urls:
	@echo visit https://greasyfork.org/zh-CN/import
	@echo "copy the following lines to import"
	@echo 
	@find . -maxdepth 1 -name '*.user.js' -print0 | while IFS= read -r -d '' file; do \
		file=$$(basename "$$file"); \
		echo "https://github.com/etng/user.js/raw/main/$$file"; \
	done

source:
	wget https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
	cat jspdf.umd.min.js|base64 -o jspdf.umd.minb64.js