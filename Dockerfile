FROM alpine
RUN apk update
RUN apk add --no-cache nodejs yarn 
RUN apk add --no-cache curl
RUN apk add --no-cache libreoffice libreoffice-base libreoffice-lang-ko ttf-freefont ttf-opensans ttf-dejavu font-noto-cjk
RUN apk add --no-cache imagemagick 
RUN apk add --no-cache ffmpeg 
RUN apk add --no-cache ghostscript
RUN apk add --no-cache build-base vips-dev
RUN apk add --no-cache python3 py3-pip 

# install Eclipse Temurin JDK
RUN curl https://packages.adoptium.net/artifactory/api/security/keypair/public/repositories/apk -o /etc/apk/keys/adoptium.rsa.pub && \
    echo 'https://packages.adoptium.net/artifactory/apk/alpine/main' >> /etc/apk/repositories && \
    apk update && apk add temurin-17-jdk

# https://github.com/unoconv/unoserver/
RUN pip install -U unoserver

# define path
ENV PATH_LO=/usr/lib/libreoffice/program
ENV PATH_SP=/usr/lib/python3.11/site-packages

RUN \
    cp "$PATH_LO"/unohelper.py "$PATH_SP"/  && \
    echo -e "\
import sys, os \n\
sys.path.append('/usr/lib/libreoffice/program') \n\
os.putenv('URE_BOOTSTRAP', 'vnd.sun.star.pathname:/usr/lib/libreoffice/program/fundamentalrc')\
" > "$PATH_SP"/uno.py  && \
    cat "$PATH_LO"/uno.py >> "$PATH_SP"/uno.py

RUN mkdir -p /usr/src/app
COPY *.json /usr/src/app/
WORKDIR /usr/src/app
RUN mkdir uploadPath
RUN mkdir previewPath
RUN yarn global add node-gyp
RUN yarn install
RUN yarn upgrade
COPY *.js /usr/src/app/
COPY *.sh /usr/src/app/
ENTRYPOINT [ "/bin/sh", "./execute.sh"]