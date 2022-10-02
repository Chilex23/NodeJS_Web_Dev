docker run \
	--name db-userauth \
	-e POSTGRES_PASSWORD=mysecretpassword \
    -e POSTGRES_DB=userauth \
    -p 5433:5432 \
    --volume `pwd`/pg_hba.conf:/var/lib/postgresql/data/pg_hba.conf \
    --volume `pwd`/../userauth-data:/var/lib/postgresql/data \
	--network authnet postgres