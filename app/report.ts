import { Fix, Changeset, Hunks } from './fix';

export class Report {

  constructor(raw:any){

    for (var attr in raw) {
      (this as any)[attr] = raw[attr];
    }
  }

  id: string; //"bug_netbeans_189621",
  date: string; // "2010-08-18T08:24:00Z",
  title: string; //"Enable collecting thread cpu timestamps by default",
  project: string; //"profiler",
  sub_project: string[];
  version: string[];
  impacted_plateform: string;  //"PC",
  impacted_os: string;// "All",
  bug_status: string; //"RESOLVED",
  resolution: string; //"FIXED",
  bug_severity: string; //"normal",
  reporter_pseudo: string; //"yardus",
  reporter_name: string; //"J Bachorik",
  assigned_to_pseudo: string; //"yardus",
  assigned_to_name: string;//"J Bachorik",
  description: string;//"Given the fact that thread cpu timestamps are available to JVM (1.6+) on all major operating systems and obtaining them is reasonably quick [1] we can enable collecting them by default. [1] On Linux and JVM 1.6 it is necessary to specify &quot;-XX:+UseLinuxPosixThreadCPUClocks&quot; JVM argument in order to enable reasonable performing implementation of obtaining the thread cpu timestamps",
  comment: string[];
  //   "yardus*`|`*J Bachorik*`|`*2010-08-18T08:26:49Z*`|`*Created attachment 101476 *`|`*101476",
  //   "yardus*`|`*J Bachorik*`|`*2010-08-18T08:44:35Z*`|`*fixed - http://hg.netbeans.org/profiler-main/rev/5422427852ea *`|`*",
  //   "quality*`|`*Quality Engineering*`|`*2010-08-25T03:22:58Z*`|`*Integrated into &amp;apos;main-golden&amp;apos;, will be available in build *201008250001* on http://bits.netbeans.org/dev/nightly/ (upload may still be in progress) Changeset: http://hg.netbeans.org/main/rev/5422427852ea User: Jaroslav Bachorik &amp;lt;yardus@netbeans.org&amp;gt; Log: #189621: Enable collecting thread cpu timestamps by default*`|`*"
  // ],
  fixing_time: number;//301,
  comments_nb: number;//4,
  positive_churns: number;//113,
  negative_churns: number;//34,
  churns: number;//147,
  hunks: number;//34,
  number_files: number;//14,
  file: string[] = [];
  //   "lib.profiler.common/src/org/netbeans/lib/profiler/common/integration/IntegrationUtils.java",
  //   "lib.profiler/release/remote-pack-defs/README.txt",
  //   "lib.profiler/release/remote-pack-defs/build.xml",
  //   "lib.profiler/release/remote-pack-defs/calibrate-16.sh",
  //   "lib.profiler/release/remote-pack-defs/profile-linux-16.sh",
  //   "lib.profiler/src/org/netbeans/lib/profiler/TargetAppRunner.java",
  //   "lib.profiler/src/org/netbeans/lib/profiler/global/CalibrationDataFileIO.java",
  //   "lib.profiler/src/org/netbeans/lib/profiler/results/cpu/TimingAdjusterOld.java",
  //   "profiler.attach/src/org/netbeans/modules/profiler/attach/providers/AbstractIntegrationProvider.java",
  //   "profiler.j2se/src/org/netbeans/modules/profiler/j2se/JavaApplicationIntegrationProvider.java",
  //   "profiler/src/org/netbeans/modules/profiler/NetBeansProfiler.java",
  //   "profiler/src/org/netbeans/modules/profiler/actions/AntActions.java",
  //   "profiler/src/org/netbeans/modules/profiler/ui/stp/Bundle.properties",
  //   "profiler/src/org/netbeans/modules/profiler/ui/stp/DefaultSettingsConfigurator.java"
  // ],
  dataset: string;//"Netbeans",
  type: string;//"BUG",

  changeset: Changeset;
  fixes: Fix[];
  showLongDescription:boolean = false;
  live_saver: number = 0;


  url():string {

    let splittedId = this.id.split('_')[2];
    switch (this.id.split('_')[1]) {
      case 'netbeans':
        return 'https://netbeans.org/bugzilla/show_bug.cgi?id=' + splittedId;
      case 'Apache':
        return 'https://issues.apache.org/jira/browse/' + splittedId;
      default:
        return 'https://netbeans.org/bugzilla/show_bug.cgi?id=' + splittedId;
    }
  }

  keywords(): string[] {

    let extension: string[] = [];

    for (var i = 0; i < this.file.length; i++) {
      extension[i] = this.file[i].split('.').pop()
    }

    return [this.mostCommonTerm(extension), this.project];
  }


  private mostCommonTerm(array:string[]):string {
    if (array.length === 0)
      return null;
    var modeMap:any = {};
    var maxEl = array[0], maxCount = 1;
    for (var i = 0; i < array.length; i++) {
      var el = array[i];
      if (modeMap[el] === null)
        modeMap[el] = 1;
      else
        modeMap[el]++;
      if (modeMap[el] > maxCount) {
        maxEl = el;
        maxCount = modeMap[el];
      }
    }
    return maxEl;
  }
}
