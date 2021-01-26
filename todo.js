const fs = require("fs");

const input = process.argv;
const length = input.length - 2;
const task = input[2];

if ((length === 0 && task === undefined) || task === "help") {
  const usage = `Usage :-
$ ./todo add "todo item"  # Add a new todo
$ ./todo ls               # Show remaining todos
$ ./todo del NUMBER       # Delete a todo
$ ./todo done NUMBER      # Complete a todo
$ ./todo help             # Show usage
$ ./todo report           # Statistics`;
  console.log(usage);
}

// add a todo
if (task === "add") {
  // array of todos to be added
  const todo = input[3];
  if (todo === undefined)
    process.stdout.write("Error: Missing todo string. Nothing added!");
  else {
    fs.appendFile("todo.txt", `${todo} \n`, function (err) {
      if (err) throw err;
      process.stdout.write('Added todo: "' + todo + '"');
    });
  }
}

// list todos in reverse order
if (task === "ls") {
  fs.readFile("todo.txt", { encoding: "utf-8" }, function (err, data) {
    if (!err) {
      let todo = data.split("\n");
      todo.pop();
      if (todo.length === 0)
        process.stdout.write("There are no pending todos!");
      // add numbers
      else {
        todo = todo.map((item, index) => `[${index + 1}] ${item.trimEnd()}`);
        todo.reverse();
        console.log(todo.join("\n"));
      }
    } else {
      process.stdout.write("There are no pending todos!");
    }
  });
}

// delete a todo
if (task === "del") {
  let del = input[3];
  if (del === undefined)
    process.stdout.write("Error: Missing NUMBER for deleting todo.");
  else {
    del = parseInt(del);
    let todo = [];
    fs.readFile("todo.txt", { encoding: "utf-8" }, async function (err, data) {
      if (!err) {
        todo = data.split("\n");
        todo.pop();
        if (del < 1 || del > todo.length) {
          process.stdout.write(
            `Error: todo #${del} does not exist. Nothing deleted.`
          );
        } else {
          todo.splice(del - 1, 1);
          fs.unlinkSync("todo.txt");
          todo.map((item, index) => {
            fs.appendFile("todo.txt", `${item} \n`, function (err) {
              if (err) process.stdout.write("There are no pending todos!");
            });
          });
          process.stdout.write("Deleted todo #" + del);
        }
      } else {
        console.log(err);
      }
    });
  }
}

// mark a todo as done
if (task === "done") {
  let doneNo = input[3];
  if (doneNo === undefined) {
    process.stdout.write("Error: Missing NUMBER for marking todo as done.");
  } else {
    doneNo = parseInt(doneNo);
    let todo = [];
    fs.readFile("todo.txt", { encoding: "utf-8" }, async function (err, data) {
      if (!err) {
        todo = data.split("\n");
        todo.pop();
        if (doneNo > 0 && doneNo <= todo.length) {
          // valid done number
          const done = todo.filter((item, index) => index === doneNo - 1)[0];
          todo.splice(doneNo - 1, 1);
          // delete done task from todo list
          fs.unlinkSync("todo.txt");
          todo.map((item, index) => {
            fs.appendFile("todo.txt", `${item} \n`, function (err) {
              if (err) process.stdout.write("There are no pending todos!");
            });
          });
          fs.appendFile("done.txt", `${done} \n`, function (err) {
            if (err) process.stdout.write("There are no pending todos!");
          });
          process.stdout.write(`Marked todo #${doneNo} as done.`);
        } else {
          process.stdout.write(`Error: todo #${doneNo} does not exist.`);
        }
      } else {
        console.log(err);
      }
    });
  }
}

if (task === "report") {
  let completed = 0,
    pending = 0;
  if (fs.existsSync("todo.txt")) {
    let todo = fs.readFileSync("todo.txt", "utf8");
    todo = todo.split("\n");
    todo.pop();
    pending = todo.length;
  }
  if (fs.existsSync("done.txt")) {
    let done = fs.readFileSync("done.txt", "utf8");
    done = done.split("\n");
    done.pop();
    completed = done.length;
  }
  const date = new Date().toISOString().substr(0, 10);
  process.stdout.write(`${date} Pending : ${pending} Completed : ${completed}`);
}
