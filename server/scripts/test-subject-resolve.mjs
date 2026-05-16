import * as fs from 'fs';

import { getSubjectByName } from "../src/services/subjects.service.js"
import { subjectsData } from "../src/data/subjects.data.js"

// in case we want to test specific queries, we can pass them as command line arguments, otherwise it will run a default set of tests
const args = process.argv.slice(2)

const defaultTests = [
  // acronyms with dots/spaces
  "B.D.",
  "B. D",
  "D.B.",
  "A. D. S.",
  // raw acronyms
  "ADS",
  "IS",
  "ISI",
  "IS1",
  "ISII",
  "isii",
  // abbreviations
  "Ing S.I",
  "Ing de S. I",
  "Ing Soft I",
  // synonym
  "Algoritmos",
  // calculus numbering
  "Calculo I",
  // baseline
  "base de datos",
  "admin BD",
]

const tests = args.length ? args : defaultTests

const defaultTest = () => {
  for (const query of tests) {
    const r = getSubjectByName(query)
    const pretty = r
      ? `${r.key} | ${r.name} | ${r.code} | ${r.career}`
      : "null"
    console.log(`${query} -> ${pretty}`)
  }
}

// MARK: - Mini dataset
const ABDNames = [
  "Administracion de Bases de Datos", "Administracion Bases de Datos", "Administracion Bases Datos", "Administracion de Base de Datos", "Administracion Base de Datos", "Administracion Base Datos", "Administracion BD", "Administracion de BD", "Administracion DB", "Administracion de DB", 
  "Admin de Bases de Datos", "Admin Bases de datos", "Admin Bases Datos", "Admin de Base de Datos", "Admin Base de datos", "Admin Base Datos", "Admin BD", "Admin de BD", "Admin DB", "Admin de DB",
  "Ad. de Bases de Datos", "Ad. Bases de Datos", "Ad. Bases Datos", "Ad. de Base de Datos", "Ad. Base de Datos", "Ad. Base Datos", "Ad. BD", "AD. de BD", "Ad. DB", "AD. de DB", 
  "Ad de Bases de Datos", "Ad Bases de Datos", "Ad Bases Datos", "Ad de Base de Datos", "Ad Base de Datos", "Ad Base Datos", "Ad BD", "AD de BD", "Ad DB", "AD de DB", 
  "ABD", "ADB"
]

const AR = [
  "Administracion de Redes", "Administracion de Red", "Administracion Redes", "Administracion Red",
  "Admin de Redes", "Admin de Red", "Admin Redes", "Admin Red",
  "Ad. de Redes", "Ad. de Red", "Ad. Redes", "Ad. Red",
  "Ad de Redes", "Ad de Red", "Ad Redes", "Ad Red",
  "AR", "Redes"
]

const AS = [
  "Administracion de Servidores", "Administracion Servidores",
  "Admin de Servidores", "Admin Servidores",
  "Ad. de Servidores", "Ad. Servidores",
  "Ad de Servidores", "Ad Servidores",
  "ADS", "A. D. S.", "AS", "Servidores"
]

const Algoritmia = ["Algoritmia", "Algoritmos"]

const BD = [
  "Bases de Datos", "Base de Datos", "Bases Datos", "Base Datos", "Base Dato", "Base de Dato",
  "BD", "DB", "B.D.", "B.D", "D.B.", "D.B", "B. D.", "B. D", "D. B.", "D. B"
]

const ISI = [
  "Ingenieria de Software I", "Ingenieria Software I", "Ingenieria de Software", "Ingenieria Software", "Ingenieria S. I", "Ingenieria S.",
  "Ing Software I", "Ing Soft I", "Ing Soft", "Ing de S.", "Ing S.", "Ing de S. I", "Ing S. I", "Ing de S.I", "Ing S.I", "Ing de S. I.", "Ing S. I.", "Ing de S.I.", "Ing S.I.",
  "Ing. Software I", "Ing. Soft I", "Ing. Soft", "Ing. S.", "Ing. S.", "Ing. de S. I", "Ing. S. I", "Ing. de S.I", "Ing. S.I", "Ing. de S. I.", "Ing. S. I.", "Ing. de S.I.", "Ing. S.I.",
  "IS", "ISI"
]

const CD = ["Calculo Diferencial", "Calculo I"]

const allSubjects = [
  {subject: "administracion de bases de datos", names: ABDNames },
  {subject: "administracion de redes", names: AR },
  {subject: "administracion de servidores", names: AS },
  {subject: "algoritmia", names: Algoritmia },
  {subject: "bases de datos", names: BD },
  {subject: "ingenieria de software i", names: ISI }
]

const testDatasetSubjects = () => {
  for (const { subject, names } of allSubjects) {
    let correctNames = 0
    console.log("Testing variation for: ", subject)
    
    for (const name of names) {
      const r = getSubjectByName(name)
      // const pretty = r
      //   ? `${r.key} | ${r.name} | ${r.code} | ${r.career}`
      //   : "null"
      if (r && r.name === subject) {
        correctNames++
        console.log(`✅ ${name} -> ${r.name}`)
      } else {
        console.log(`❌ ${name} -> ${r ? r.name : "null"}`)
      }
    }
    console.log(`\n🧮 Results for ${subject}: ${correctNames}/${names.length} correct\n`)
  }
}

const AllSubjectsTest = () => {
  // Read all subjects from data subjects.data.js
  const data = subjectsData.INNI
  const allSubjects = Object.values(data).map(s => s.name)
  console.log("Testing all subjects in dataset, total:", allSubjects.length)

  let correct = 0
  for (const subject of allSubjects) {
    const r = getSubjectByName(subject)
    if (r && r.name === subject) {
      correct++
      console.log(`✅ ${subject} -> ${r.name}`)
    } else {
      console.log(`❌ ${subject} -> ${r ? r.name : "null"}`)
    }
  }
  console.log(`\n🧮 Results for all subjects: ${correct}/${allSubjects.length} correct\n`)
}

const testStudyPlanFiles = (career) => {
  // Read study_plan from subjectsData and check if they are correctly resolved
  const data = subjectsData[career]

  for (const [key, subject] of Object.entries(data)) {
    const r = getSubjectByName(subject.files.study_plan.replace('.pdf', ''))
    if (r?.name === subject.name) {
      console.log(`✅ ${subject.files.study_plan.replace('.pdf', '')} -> ${r.name}`)
    } else {
      console.log(`❌ ${subject.files.study_plan.replace('.pdf', '')} -> ${r ? r.name : "null"}`)
    }
  }
}

const testSyncFiles = (career, { studyPlan = false, material = false }) => {
  // Read study_plan from subjectsData
  const data = subjectsData[career]
  // Order by subject name alphabetically
  const sortedData = Object.entries(data).sort((a, b) => a[1].name.localeCompare(b[1].name))

  // for (const [key, subject] of Object.entries(data)) {
  for (const [key, subject] of sortedData) {
    const studyPlanPath = `./src/files/study_plan/${career}/${subject.files.study_plan}`
    const materialPath = `./src/files/material/${subject.files.material}`

    // Read study_plan files from filesystem and check if they are correctly resolved to subjects
    const studyPlanExists = fs.existsSync(studyPlanPath)
    const materialExists = fs.existsSync(materialPath)

    if (studyPlan && material) {
      if (studyPlanExists && materialExists) {
        console.log(`✅ ${subject.name} -> Both files exist`)
      } else if (!studyPlanExists && !materialExists) {
        console.log(`❌ ${subject.name} -> Both files are missing`)
      } else if (!studyPlanExists) {
        console.log(`❌ ${subject.name} -> Study plan file is missing`)
      } else {
        console.log(`❌ ${subject.name} -> Material file is missing`)
      }
    } else if (studyPlan) {
      if (studyPlanExists) {
        console.log(`✅ ${subject.name} -> Study plan file exists`)
      } else {
        console.log(`❌ ${subject.name} -> Study plan file is missing`)
      }
    } else if (material) {
      if (materialExists) {
        console.log(`✅ ${subject.name} -> Material file exists`)
      } else {
        console.log(`❌ ${subject.name} -> Material file is missing`)
      }
    }
  }
}


// defaultTest()
console.log("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-")
testDatasetSubjects()
console.log("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-")
// AllSubjectsTest()
console.log("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-")
// testStudyPlanFiles('INNI')
console.log("-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-")
// testSyncFiles("INFO", { studyPlan: true, material: false })