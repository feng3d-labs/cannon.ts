namespace cannon
{
    export class PointToPointConstraint extends Constraint
    {
        /**
         * Pivot, defined locally in bodyA.
         */
        pivotA: Vec3;
        /**
         * Pivot, defined locally in bodyB.
         */
        pivotB: Vec3;
        equationX: ContactEquation;
        equationY: ContactEquation;
        equationZ: ContactEquation;

        /**
         * Connects two bodies at given offset points.
         * 
         * @param bodyA
         * @param pivotA The point relative to the center of mass of bodyA which bodyA is constrained to.
         * @param bodyB Body that will be constrained in a similar way to the same point as bodyA. We will therefore get a link between bodyA and bodyB. If not specified, bodyA will be constrained to a static point.
         * @param pivotB See pivotA.
         * @param maxForce The maximum force that should be applied to constrain the bodies.
         *
         * @example
         *     var bodyA = new Body({ mass: 1 });
         *     var bodyB = new Body({ mass: 1 });
         *     bodyA.position.set(-1, 0, 0);
         *     bodyB.position.set(1, 0, 0);
         *     bodyA.addShape(shapeA);
         *     bodyB.addShape(shapeB);
         *     world.addBody(bodyA);
         *     world.addBody(bodyB);
         *     var localPivotA = new Vec3(1, 0, 0);
         *     var localPivotB = new Vec3(-1, 0, 0);
         *     var constraint = new PointToPointConstraint(bodyA, localPivotA, bodyB, localPivotB);
         *     world.addConstraint(constraint);
         */
        constructor(bodyA: Body, pivotA: Vec3, bodyB: Body, pivotB: Vec3, maxForce?: number)
        {
            super(bodyA, bodyB);

            maxForce = typeof (maxForce) !== 'undefined' ? maxForce : 1e6;

            this.pivotA = pivotA ? pivotA.clone() : new Vec3();

            this.pivotA = pivotB ? pivotB.clone() : new Vec3();//?

            var x = this.equationX = new ContactEquation(bodyA, bodyB);

            var y = this.equationY = new ContactEquation(bodyA, bodyB);

            var z = this.equationZ = new ContactEquation(bodyA, bodyB);

            // Equations to be fed to the solver
            this.equations.push(x, y, z);

            // Make the equations bidirectional
            x.minForce = y.minForce = z.minForce = -maxForce;
            x.maxForce = y.maxForce = z.maxForce = maxForce;

            x.ni.set(1, 0, 0);
            y.ni.set(0, 1, 0);
            z.ni.set(0, 0, 1);
        }

        update()
        {
            var bodyA = this.bodyA;
            var bodyB = this.bodyB;
            var x = this.equationX;
            var y = this.equationY;
            var z = this.equationZ;

            // Rotate the pivots to world space
            bodyA.quaternion.vmult(this.pivotA, x.ri);
            bodyB.quaternion.vmult(this.pivotB, x.rj);

            y.ri.copy(x.ri);
            y.rj.copy(x.rj);
            z.ri.copy(x.ri);
            z.rj.copy(x.rj);
        };
    }
}