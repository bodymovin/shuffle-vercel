import fs from 'fs';
import path from 'path';

const walk = function (dir, counter, levels, done) {
  let results = [];
  console.log('counter', counter)
  console.log('levels', levels)
  if (counter === levels) {
    return done(null, results);
  }
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, counter + 1, levels, (err, res) => {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    }());
  });
};

const promiWalk = (dir: string, levels: number): Promise<any> => new Promise((resolve, reject) => {
  walk(dir, 0, levels, (error: any, data: any) => {
    if (error) {
      reject(error);
    } else {
      resolve(data);
    }
  });
});

export default promiWalk;
