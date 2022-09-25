#!/bin/bash

for file in ./test_instances_small_more/*; do
  glpsol -m ../linear_programming/weighted_bipartite_matching/maximum_weight_bipartite_matching.mod -d "$file" > "$file.output";
done