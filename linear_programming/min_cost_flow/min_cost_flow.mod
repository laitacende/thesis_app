# Author: Aleksandra Gołębiowska, 2022
# This is a part of my engineer thesis
# Linear programming model solving minimum cost flow of graph given in data file
# Usage: glpsol -m min_cost_flow.mod -d filename.dat
# Data file format:
# set N := i j;
#
# set A :=
#   i j
#   ;
#
# param:
#   capacity :=
#       i j u
#       ;
#
# param:
#   cost :=
#       i j c
#       ;
#
# param:
#   balance :=
#       i b
#       ;
#
# end;


# nodes
set N;

# arcs
set A within N cross N;

# capacity of arc (i, j)
param capacity{(i, j) in A} >= 0;

# cost of arc (i, j)
param cost{(i, j) in A}, integer, >= 0;

# balance of node i
param balance{i in N}, integer;


# decision variables, flow on arc
var x{(i, j) in A}, integer , >= 0;

# objective function - minimize cost flow
minimize obj: sum{(i, j) in A} x[i, j] * cost[i, j];

# constraints
s.t. c1{(i, j) in A}: x[i, j] <= capacity[i, j];
s.t. c3{i in N}:  sum{(i, j) in A} x[i, j] - sum{(j, i) in A} x[j, i] = balance[i];


solve;
printf "i    j    flow\n";
printf {(i, j) in A} "%-4d %-4d %-5d\n", i, j, x[i, j];
printf "Cost: %d\n", sum{(i, j) in A} x[i, j] * cost[i, j];
end;
