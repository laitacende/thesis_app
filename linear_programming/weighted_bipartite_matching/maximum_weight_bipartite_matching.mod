# Linear programming model solving maximum weight bipartite matching
# Usage: glpsol -m maximum_weight_bipartite_matching.mod -d filename.dat
# Data file format:
# set N1 := i j;
# set N2 := i j;
# set A :=
#   i j
#   ;
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
set N1;
set N2;

# arcs
set A := N1 cross N2;

# cost of arc (i, j)
param cost{(i, j) in A}, integer, >= 0;

# decision variables, flow on arc
var x{(i, j) in A}, integer , >= 0, <= 1;

# objective function - maximize matching
maximize obj: sum{(i, j) in A} x[i, j] * cost[i, j];

# constraints
s.t. c1{i in N1}: sum{j in N2} x[i, j] = 1;
s.t. c2{i in N2}: sum{j in N1} x[j, i] = 1;

solve;
printf "i    j    x[i, j]\n";
printf {(i, j) in A} "%-4d %-4d %-5d\n", i, j, x[i, j];
printf "Cost: %d\n", sum{(i, j) in A} x[i, j] * cost[i, j];
end;
