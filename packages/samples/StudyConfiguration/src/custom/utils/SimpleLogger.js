const log = (...args) => {
  process.stdout.write(args.join(' ') + '\n');
};

export default log;