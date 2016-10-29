const stream = (options) => {
    const {start, stop, gen} = options;

    function _gen(n) {
        return stop(n) ?
        { next: () => _gen(n), value: () => n, done: true } :
        { next: () => _gen(gen(n)), value: () => n, done: false }
    }
    return (_gen(start));
};

const concat = (left, right) => { return {
    next:  () => left.done ? right : concat(left.next(), right),
    value: () => left.value(),
    done: left.done && right.done,
}};

const fold = z => f => s => { return {
    next:  () => fold(f(z, s.next().value()))(f)(s.next()),
    value: () => z,
    done: s.done,
}};

const take = n => s => { return {
    next:  () => take(n - 1)(s.next()),
    value: () => s.value(),
    done: s.done || n == 0,
}};

const traverse = f => s => { return {
    next:  () => traverse(f)(s.next()),
    value: () => f(s).value(),
    done: s.done,
}};

const until = f => s => { return {
    next:  () => until(f)(s.next()),
    value: () => s.value(),
    done: s.done || f(s),
}};

const zip = f => (left, right) => { return {
    next:  () => zip(f)(left.next(), right.next()),
    value: () => f(left.value(), right.value()),
    done: left.done || right.done,
}};

const drop = n => s => traverse(_ => n > 0 ? drop(n - 1)(_.next()) : _)(s);
const filter = f => s => traverse(_ => f(_.value()) ? _ : filter(f)(_.next()))(s);
const map = f => s => fold(f(s.value()))((_, v) => f(v))(s);
const zipWithIndex = s => zip((i, v) => { return { index: i, value: v } })(ints, s);

//################################################################################

const iter = stream => f => {
    let it = stream;
    while (!it.done) {
        f(it.value());
        it = it.next();
    }
};

//################################################################################

const ints = stream({start: 0, stop: _ => false, gen: _ => _ + 1});
const alpha = map(_ => String.fromCharCode(97 + _))(take(26)(ints));

const alphaInt = zip((a, b) => `${a} - ${b}`)(alpha, ints);
const zero2ten = take(11)(ints);
const first = concat(take(5)(ints), take(5)(alpha))

//const five2ten = drop(5)(zero2ten);
const evenInts = filter(_ => _ % 2 == 0)(zero2ten);
iter(take(2)(evenInts))(_ => console.log(_));
//iter(drop(5)(zero2ten))( _ => console.log(_));





