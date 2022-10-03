FROM postgres

EXPOSE 5432

COPY pg_hba.conf /var/lib/postgresql/data

ENV POSTGRES_PASSWORD=mysecretpassword
ENV POSTGRES_DB=userauth

CMD [  "--character-set-server=utf8mb4", \
    "--collation-server=utf8mb4_unicode_ci", \
    "--bind-address=0.0.0.0" ]