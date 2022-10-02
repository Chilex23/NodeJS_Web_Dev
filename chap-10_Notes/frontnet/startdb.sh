docker run \
	--name db-notes \
	-e POSTGRES_PASSWORD=mysecretpassword \
    -e POSTGRES_DB=notes \
    -p 5434:5432 \
    --volume `pwd`/pg_hba.conf:/var/lib/pg_hba.conf \
    --volume `pwd`/../notes-data:/var/lib \
	--network frontnet postgres