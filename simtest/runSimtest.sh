#!/bin/bash

pvinstall="$1"
pvconfigs="$2"

NODE="$pvinstall/node/bin"
export PATH=$NODE:$PATH

title="$3"
test="$4"
instances="$5"
users="$6"

now="$(date +'%Y%m%d%H%M%S')"
logFolder="$test-$instances-$users-$now"
mkdir -p "./$title/$logFolder"

for ((i=0; i<$instances; i++))
do
	printf "starting simtest $title - $test at $users users for $i\n"
    nohup node simtest.js $pvconfigs pv_pricingtool_$i pricingTool demo1@pvelocity.com pvelocity3 null $test $users 5 600 > ./$title/$logFolder/$test-$i.out 2> ./$title/$logFolder/$test-$i.err < /dev/null &
done

printf "results: ./$title/$logFolder/\n"
