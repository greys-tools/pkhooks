// pro-tip: since devalue doesn't run toJSON on class objects
// (for some reason, aka because fidelity or something),
// you can just do this to run it yourself :)
export const transport = {
	all: {
		encode: (value) => value?.toJSON && value.toJSON(),
		decode: (v) => v
	}
};